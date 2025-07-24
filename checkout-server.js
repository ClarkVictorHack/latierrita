const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configuración de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://www.paypal.com", "https://www.sandbox.paypal.com", "https://www.googletagmanager.com", "https://tracker.metricool.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://www.paypal.com", "https://www.sandbox.paypal.com", "https://www.google-analytics.com"]
    }
  }
}));

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('.'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.'
});
app.use(limiter);

// Rate limiting más estricto para endpoints de checkout
const checkoutLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 5, // máximo 5 pedidos por IP en 5 minutos
  message: 'Demasiados pedidos realizados, espera unos minutos antes de intentar de nuevo.'
});

// Configuración de email (Nodemailer)
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Base de datos en memoria (en producción usar MongoDB o PostgreSQL)
let orders = [];
let orderCounter = 1000;

// Modelos de datos
class Order {
  constructor(data) {
    this.id = `LT${String(orderCounter++).padStart(6, '0')}`;
    this.orderNumber = this.id;
    this.customer = data.customer;
    this.delivery = data.delivery;
    this.items = data.items;
    this.paymentMethod = data.paymentMethod;
    this.totals = data.totals;
    this.status = 'pending';
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.notes = data.notes || '';
    this.paymentStatus = 'pending';
    this.trackingNumber = null;
  }
}

// Validaciones
const orderValidation = [
  body('customer.firstName').trim().isLength({ min: 2 }).withMessage('Nombre debe tener al menos 2 caracteres'),
  body('customer.lastName').trim().isLength({ min: 2 }).withMessage('Apellido debe tener al menos 2 caracteres'),
  body('customer.email').isEmail().withMessage('Email inválido'),
  body('customer.phone').matches(/^[0-9+\-\s()]+$/).withMessage('Teléfono inválido'),
  body('delivery.address').trim().isLength({ min: 10 }).withMessage('Dirección debe ser más específica'),
  body('delivery.city').trim().isLength({ min: 2 }).withMessage('Ciudad requerida'),
  body('items').isArray({ min: 1 }).withMessage('Debe incluir al menos un producto'),
  body('paymentMethod').isIn(['paypal', 'transfer', 'cod']).withMessage('Método de pago inválido'),
  body('totals.total').isFloat({ min: 1 }).withMessage('Total inválido')
];

// Rutas principales
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/productos', (req, res) => {
  res.sendFile(path.join(__dirname, 'productos.html'));
});

app.get('/checkout', (req, res) => {
  res.sendFile(path.join(__dirname, 'checkout.html'));
});

app.get('/order-confirmation', (req, res) => {
  res.sendFile(path.join(__dirname, 'order-confirmation.html'));
});

// API para crear pedidos
app.post('/api/orders', checkoutLimiter, orderValidation, async (req, res) => {
  try {
    // Validar datos
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos de pedido inválidos',
        errors: errors.array()
      });
    }

    // Crear nuevo pedido
    const order = new Order(req.body);
    orders.push(order);

    // Guardar en archivo (simulando base de datos)
    await saveOrderToFile(order);

    // Enviar email de confirmación
    await sendOrderConfirmation(order);

    // Respuesta exitosa
    res.status(201).json({
      success: true,
      message: 'Pedido creado exitosamente',
      orderId: order.id,
      orderNumber: order.orderNumber
    });

  } catch (error) {
    console.error('Error al crear pedido:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// API para obtener pedido por ID
app.get('/api/orders/:orderId', (req, res) => {
  try {
    const order = orders.find(o => o.id === req.params.orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }

    res.json({
      success: true,
      order: order
    });

  } catch (error) {
    console.error('Error al obtener pedido:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// API para actualizar estado de pedido
app.patch('/api/orders/:orderId/status', [
  body('status').isIn(['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled']).withMessage('Estado inválido'),
  body('paymentStatus').optional().isIn(['pending', 'paid', 'failed', 'refunded']).withMessage('Estado de pago inválido')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos inválidos',
        errors: errors.array()
      });
    }

    const order = orders.find(o => o.id === req.params.orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }

    // Actualizar estado
    if (req.body.status) order.status = req.body.status;
    if (req.body.paymentStatus) order.paymentStatus = req.body.paymentStatus;
    if (req.body.trackingNumber) order.trackingNumber = req.body.trackingNumber;
    order.updatedAt = new Date();

    res.json({
      success: true,
      message: 'Estado actualizado exitosamente',
      order: order
    });

  } catch (error) {
    console.error('Error al actualizar pedido:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// API para obtener todos los pedidos (panel administrativo)
app.get('/api/orders', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;

    let filteredOrders = orders;
    if (status) {
      filteredOrders = orders.filter(o => o.status === status);
    }

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

    res.json({
      success: true,
      orders: paginatedOrders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(filteredOrders.length / limit),
        totalOrders: filteredOrders.length,
        hasNextPage: endIndex < filteredOrders.length,
        hasPrevPage: startIndex > 0
      }
    });

  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// API para estadísticas de ventas
app.get('/api/stats', (req, res) => {
  try {
    const today = new Date();
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const thisYear = new Date(today.getFullYear(), 0, 1);

    const stats = {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + order.totals.total, 0),
      ordersToday: orders.filter(o => o.createdAt >= new Date(today.toDateString())).length,
      ordersThisMonth: orders.filter(o => o.createdAt >= thisMonth).length,
      ordersThisYear: orders.filter(o => o.createdAt >= thisYear).length,
      ordersByStatus: {
        pending: orders.filter(o => o.status === 'pending').length,
        confirmed: orders.filter(o => o.status === 'confirmed').length,
        preparing: orders.filter(o => o.status === 'preparing').length,
        shipped: orders.filter(o => o.status === 'shipped').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length
      },
      popularProducts: getPopularProducts()
    };

    res.json({
      success: true,
      stats: stats
    });

  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Funciones auxiliares
async function saveOrderToFile(order) {
  try {
    const ordersDir = path.join(__dirname, 'data');
    if (!fs.existsSync(ordersDir)) {
      fs.mkdirSync(ordersDir, { recursive: true });
    }

    const filePath = path.join(ordersDir, `order_${order.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(order, null, 2));
  } catch (error) {
    console.error('Error al guardar pedido en archivo:', error);
  }
}

async function sendOrderConfirmation(order) {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('SMTP no configurado, saltando envío de email');
      return;
    }

    const mailOptions = {
      from: `"La Tierrita" <${process.env.SMTP_USER}>`,
      to: order.customer.email,
      subject: `Confirmación de Pedido #${order.orderNumber} - La Tierrita`,
      html: generateOrderEmailHTML(order)
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email de confirmación enviado para pedido ${order.orderNumber}`);
  } catch (error) {
    console.error('Error al enviar email:', error);
  }
}

function generateOrderEmailHTML(order) {
  const itemsHTML = order.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Confirmación de Pedido - La Tierrita</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #f6d55c;">La Tierrita</h1>
          <p style="color: #666;">Bocaditos tradicionales del campo ecuatoriano</p>
        </div>
        
        <h2 style="color: #f6d55c;">¡Gracias por tu pedido!</h2>
        <p>Hola ${order.customer.firstName},</p>
        <p>Hemos recibido tu pedido y pronto comenzaremos a prepararlo con el cariño de siempre.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Detalles del Pedido #${order.orderNumber}</h3>
          <p><strong>Fecha:</strong> ${order.createdAt.toLocaleDateString('es-ES')}</p>
          <p><strong>Estado:</strong> Pendiente de confirmación</p>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background: #f8f9fa;">
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6;">Producto</th>
              <th style="padding: 12px; text-align: center; border-bottom: 2px solid #dee2e6;">Cantidad</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #dee2e6;">Precio</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #dee2e6;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding: 12px; text-align: right; font-weight: bold;">Total:</td>
              <td style="padding: 12px; text-align: right; font-weight: bold; color: #f6d55c;">$${order.totals.total.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
        
        <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin-top: 0;">Información de Entrega</h4>
          <p><strong>Dirección:</strong> ${order.delivery.address}</p>
          <p><strong>Ciudad:</strong> ${order.delivery.city}</p>
          <p><strong>Método de Pago:</strong> ${order.paymentMethod === 'paypal' ? 'PayPal' : order.paymentMethod === 'transfer' ? 'Transferencia Bancaria' : 'Pago Contra Entrega'}</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p>¿Tienes alguna pregunta sobre tu pedido?</p>
          <p>Contáctanos por WhatsApp: <a href="https://wa.me/593987843771" style="color: #f6d55c;">+593 98 784 3771</a></p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px;">
          <p>&copy; 2025 La Tierrita. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function getPopularProducts() {
  const productCounts = {};
  
  orders.forEach(order => {
    order.items.forEach(item => {
      if (productCounts[item.id]) {
        productCounts[item.id].quantity += item.quantity;
      } else {
        productCounts[item.id] = {
          id: item.id,
          name: item.name,
          quantity: item.quantity
        };
      }
    });
  });

  return Object.values(productCounts)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);
}

// Cargar pedidos existentes al iniciar el servidor
function loadExistingOrders() {
  try {
    const ordersDir = path.join(__dirname, 'data');
    if (fs.existsSync(ordersDir)) {
      const files = fs.readdirSync(ordersDir);
      files.forEach(file => {
        if (file.startsWith('order_') && file.endsWith('.json')) {
          try {
            const orderData = fs.readFileSync(path.join(ordersDir, file), 'utf8');
            const order = JSON.parse(orderData);
            orders.push(order);
            
            // Actualizar contador
            const orderNum = parseInt(order.id.replace('LT', ''));
            if (orderNum >= orderCounter) {
              orderCounter = orderNum + 1;
            }
          } catch (error) {
            console.error(`Error al cargar pedido ${file}:`, error);
          }
        }
      });
      console.log(`Cargados ${orders.length} pedidos existentes`);
    }
  } catch (error) {
    console.error('Error al cargar pedidos existentes:', error);
  }
}

// Manejo de errores
app.use((error, req, res, next) => {
  console.error('Error no manejado:', error);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor'
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

// Iniciar servidor
loadExistingOrders();

app.listen(PORT, () => {
  console.log(`🚀 Servidor de La Tierrita ejecutándose en puerto ${PORT}`);
  console.log(`📊 ${orders.length} pedidos cargados en la base de datos`);
  console.log(`🌐 Visita: http://localhost:${PORT}`);
});

module.exports = app;

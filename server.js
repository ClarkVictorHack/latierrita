// server.js - Backend para integración con PayPal
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// Configuración de PayPal
const PAYPAL_CONFIG = {
    client_id: process.env.PAYPAL_CLIENT_ID || 'sb',
    client_secret: process.env.PAYPAL_CLIENT_SECRET || 'sb-secret',
    base_url: process.env.NODE_ENV === 'production' 
        ? 'https://api.paypal.com' 
        : 'https://api.sandbox.paypal.com'
};

// Función para obtener token de acceso de PayPal
async function getPayPalAccessToken() {
    try {
        const auth = Buffer.from(`${PAYPAL_CONFIG.client_id}:${PAYPAL_CONFIG.client_secret}`).toString('base64');
        
        const response = await fetch(`${PAYPAL_CONFIG.base_url}/v1/oauth2/token`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'grant_type=client_credentials'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error('Error al obtener token de PayPal:', error);
        throw error;
    }
}

// Endpoint para crear orden
app.post('/api/orders', async (req, res) => {
    try {
        console.log('Creando orden PayPal:', req.body);
        
        const { intent, purchase_units } = req.body;
        
        // Validar datos de entrada
        if (!intent || !purchase_units || !purchase_units[0] || !purchase_units[0].amount) {
            return res.status(400).json({
                error: 'Datos de orden incompletos'
            });
        }
        
        // Obtener token de acceso
        const accessToken = await getPayPalAccessToken();
        
        // Crear orden en PayPal
        const orderData = {
            intent: intent,
            purchase_units: purchase_units,
            payment_source: {
                paypal: {
                    experience_context: {
                        payment_method_preference: "IMMEDIATE_PAYMENT_REQUIRED",
                        brand_name: "La Tierrita",
                        locale: "es-ES",
                        landing_page: "LOGIN",
                        user_action: "PAY_NOW"
                    }
                }
            }
        };
        
        const response = await fetch(`${PAYPAL_CONFIG.base_url}/v2/checkout/orders`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'PayPal-Request-Id': `la-tierrita-${Date.now()}`
            },
            body: JSON.stringify(orderData)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error de PayPal:', errorText);
            throw new Error(`PayPal API error: ${response.status}`);
        }
        
        const order = await response.json();
        console.log('Orden creada exitosamente:', order.id);
        
        res.json(order);
    } catch (error) {
        console.error('Error al crear orden:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            message: error.message
        });
    }
});

// Endpoint para capturar orden
app.post('/api/orders/:orderID/capture', async (req, res) => {
    try {
        const { orderID } = req.params;
        console.log('Capturando orden:', orderID);
        
        if (!orderID) {
            return res.status(400).json({
                error: 'ID de orden requerido'
            });
        }
        
        // Obtener token de acceso
        const accessToken = await getPayPalAccessToken();
        
        // Capturar orden en PayPal
        const response = await fetch(`${PAYPAL_CONFIG.base_url}/v2/checkout/orders/${orderID}/capture`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'PayPal-Request-Id': `la-tierrita-capture-${Date.now()}`
            }
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error al capturar orden:', errorText);
            throw new Error(`PayPal capture error: ${response.status}`);
        }
        
        const captureData = await response.json();
        console.log('Orden capturada exitosamente:', captureData);
        
        // Aquí puedes agregar lógica adicional como:
        // - Guardar la transacción en base de datos
        // - Enviar confirmación por email
        // - Actualizar inventario
        // - Crear registro de pedido
        
        res.json(captureData);
    } catch (error) {
        console.error('Error al capturar orden:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            message: error.message
        });
    }
});

// Endpoint para obtener detalles de orden (opcional)
app.get('/api/orders/:orderID', async (req, res) => {
    try {
        const { orderID } = req.params;
        
        const accessToken = await getPayPalAccessToken();
        
        const response = await fetch(`${PAYPAL_CONFIG.base_url}/v2/checkout/orders/${orderID}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`PayPal API error: ${response.status}`);
        }
        
        const orderData = await response.json();
        res.json(orderData);
    } catch (error) {
        console.error('Error al obtener orden:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            message: error.message
        });
    }
});

// Webhook endpoint (opcional para notificaciones de PayPal)
app.post('/api/webhooks/paypal', express.raw({type: 'application/json'}), (req, res) => {
    try {
        const payload = req.body;
        const headers = req.headers;
        
        console.log('Webhook recibido:', {
            event_type: payload.event_type,
            resource_type: payload.resource_type,
            summary: payload.summary
        });
        
        // Aquí puedes verificar la firma del webhook para seguridad
        // y procesar diferentes tipos de eventos:
        // - PAYMENT.CAPTURE.COMPLETED
        // - PAYMENT.CAPTURE.DENIED
        // - CHECKOUT.ORDER.APPROVED
        // etc.
        
        res.status(200).send('OK');
    } catch (error) {
        console.error('Error procesando webhook:', error);
        res.status(500).send('Error');
    }
});

// Endpoint de salud
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Servir archivos estáticos desde el directorio actual
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/productos', (req, res) => {
    res.sendFile(path.join(__dirname, 'productos.html'));
});

// Manejo de errores global
app.use((error, req, res, next) => {
    console.error('Error global:', error);
    res.status(500).json({
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Algo salió mal'
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`🌐 Frontend: http://localhost:${PORT}`);
    console.log(`🛒 Productos: http://localhost:${PORT}/productos`);
    console.log(`💳 PayPal Mode: ${process.env.NODE_ENV === 'production' ? 'LIVE' : 'SANDBOX'}`);
});

module.exports = app;

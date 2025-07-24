# La Tierrita - E-commerce Completo 🌾

## Descripción
E-commerce completo para "La Tierrita" - Bocaditos tradicionales del campo ecuatoriano. Sistema integral con carrito de compras, checkout, procesamiento de pagos, gestión de pedidos y panel administrativo.

## 🚀 Características Principales

### Frontend
- **Catálogo de Productos**: 8 productos con páginas individuales
- **Carrito de Compras**: Funcionalidad completa con localStorage
- **Checkout Seguro**: Múltiples métodos de pago
- **Responsive Design**: Optimizado para móvil y desktop
- **Analytics**: Google Analytics + Metricool integrados

### Backend
- **API RESTful**: Gestión completa de pedidos
- **Base de Datos**: Sistema de archivos JSON (listo para MongoDB)
- **Email**: Confirmaciones automáticas de pedidos
- **Seguridad**: Rate limiting, validación de datos, CORS
- **Panel Admin**: Gestión completa de pedidos y estadísticas

### Pagos
- **PayPal**: Integración completa con SDK
- **Transferencia Bancaria**: Información automática
- **Pago Contra Entrega**: Opción disponible

## 📁 Estructura del Proyecto

```
├── index.html              # Página principal (bestsellers)
├── productos.html          # Catálogo completo
├── checkout.html           # Sistema de checkout
├── order-confirmation.html # Confirmación de pedidos
├── admin.html             # Panel administrativo
├── nuestra-historia.html   # Historia de la empresa
├── carrito.js             # Lógica del carrito
├── style.css              # Estilos principales
├── server.js              # Servidor PayPal (puerto 3000)
├── checkout-server.js     # Servidor checkout (puerto 3001)
├── package.json           # Dependencias del proyecto
├── .env.example          # Variables de entorno
├── data/                 # Carpeta de pedidos (se crea automáticamente)
└── img/                  # Imágenes de productos
```

### Páginas de Productos Individuales
- `pan-de-yuca.html` - Pan de Yuca ($3.50)
- `maria-pipona-maduro.html` - María Pipona de Maduro ($3.00)
- `mini-bolones-maduro.html` - Mini Bolones de Maduro ($3.50)
- `maria-pipona-verde.html` - María Pipona de Verde ($3.00)
- `mini-bolones-verde.html` - Mini Bolones de Verde ($3.50)
- `mini-muchin.html` - Mini Muchín ($3.50)
- `muchines-de-yuca.html` - Muchines de Yuca ($3.00)
- `torrejas.html` - Torrejas ($3.00)

## ⚙️ Configuración e Instalación

### Requisitos Previos
- Node.js 16.0.0 o superior
- NPM o Yarn
- Cuenta de PayPal Developer (para pagos)
- Cuenta de email con App Password (para confirmaciones)

### 1. Clonar e Instalar Dependencias

```bash
# Clonar repositorio
git clone [url-del-repositorio]
cd la-tierrita-ecommerce

# Instalar dependencias
npm install
```

### 2. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env con tus configuraciones
```

#### Variables Importantes:

```env
# PayPal (Obtener en https://developer.paypal.com)
PAYPAL_CLIENT_ID=tu_paypal_client_id
PAYPAL_CLIENT_SECRET=tu_paypal_client_secret

# Email para confirmaciones
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_app_password

# Configuración del servidor
NODE_ENV=development
PORT=3000
CHECKOUT_PORT=3001
```

### 3. Configurar PayPal

1. Ir a [PayPal Developer](https://developer.paypal.com)
2. Crear una aplicación
3. Obtener Client ID y Client Secret
4. Para desarrollo usar Sandbox
5. Para producción usar Live credentials

### 4. Configurar Email

1. Usar Gmail con App Password:
   - Ir a Configuración de Google Account
   - Activar 2FA
   - Generar App Password
   - Usar esa contraseña en SMTP_PASS

### 5. Ejecutar el Sistema

```bash
# Servidor principal (PayPal + Sitio web)
npm start
# o
node server.js

# En otra terminal: Servidor de checkout
node checkout-server.js
```

## 🌐 URLs del Sistema

- **Sitio Web**: http://localhost:3000
- **API Checkout**: http://localhost:3001
- **Panel Admin**: http://localhost:3000/admin.html

## 📊 API Endpoints

### Pedidos
- `POST /api/orders` - Crear nuevo pedido
- `GET /api/orders` - Listar pedidos (con paginación)
- `GET /api/orders/:id` - Obtener pedido específico
- `PATCH /api/orders/:id/status` - Actualizar estado

### Estadísticas
- `GET /api/stats` - Estadísticas generales

### Ejemplo de Pedido
```json
{
  "customer": {
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan@email.com",
    "phone": "+593987654321"
  },
  "delivery": {
    "address": "Av. Principal 123, Sector Norte",
    "city": "Quito"
  },
  "items": [
    {
      "id": "pan-yuca",
      "name": "Pan de Yuca",
      "price": 3.50,
      "quantity": 2
    }
  ],
  "paymentMethod": "paypal",
  "totals": {
    "subtotal": 7.00,
    "shipping": 0.00,
    "tax": 0.84,
    "total": 7.84
  }
}
```

## 🛡️ Seguridad

### Implementadas
- Rate limiting (100 requests/15min general, 5 pedidos/5min)
- Validación de datos con express-validator
- Helmet.js para headers de seguridad
- CORS configurado
- Sanitización de inputs

### Recomendaciones para Producción
- Usar HTTPS
- Configurar firewall
- Usar base de datos real (MongoDB)
- Configurar backups automáticos
- Monitoreo de logs

## 📧 Sistema de Email

### Configuración
El sistema envía emails automáticos de confirmación con:
- Detalles del pedido
- Información de entrega
- Método de pago
- Contacto para soporte

### Templates
Los emails incluyen HTML styling y son responsive.

## 📱 Analytics

### Google Analytics
- ID: G-LXG5F7LK42
- E-commerce tracking habilitado
- Eventos de compra automatizados

### Metricool
- Hash: 8b8c5c6b2e8f24a5a4d8e68b37f8
- Tracking de todas las páginas

## 🎨 Personalización

### Colores Principales
```css
:root {
  --naranja-mostaza: #f6d55c;
  --texto-principal: #2d3748;
  --fondo-claro: #f7fafc;
}
```

### Agregar Nuevos Productos
1. Crear imagen en `/img/`
2. Crear página HTML siguiendo el patrón existente
3. Actualizar `productos.html`
4. Agregar al carrito en `carrito.js`

## 🔧 Desarrollo

### Estructura del Carrito
```javascript
// Formato de item en carrito
{
  id: 'producto-id',
  name: 'Nombre del Producto',
  price: 3.50,
  quantity: 2,
  image: 'img/producto.jpg'
}
```

### Agregar Nuevas Funcionalidades
1. Backend: Agregar endpoints en `checkout-server.js`
2. Frontend: Implementar en JavaScript
3. Styling: Agregar CSS en `style.css`

## 📦 Producción

### Deployment
1. Configurar servidor (VPS/Cloud)
2. Instalar Node.js y dependencies
3. Configurar variables de entorno
4. Usar PM2 para proceso manager
5. Configurar nginx como proxy reverso
6. Configurar SSL con Let's Encrypt

### Comandos de Producción
```bash
# Instalar PM2
npm install -g pm2

# Ejecutar aplicaciones
pm2 start server.js --name "tierrita-web"
pm2 start checkout-server.js --name "tierrita-api"

# Guardar configuración
pm2 save
pm2 startup
```

## 🐛 Troubleshooting

### Problemas Comunes

1. **PayPal no funciona**
   - Verificar Client ID y Secret
   - Comprobar variables de entorno
   - Revisar sandbox vs production

2. **Emails no se envían**
   - Verificar SMTP credentials
   - Revisar App Password de Gmail
   - Comprobar firewall/puertos

3. **Carrito se borra**
   - Verificar localStorage en navegador
   - Comprobar JavaScript errors en consola

4. **Pedidos no se guardan**
   - Verificar permisos de carpeta `/data/`
   - Revisar logs del servidor
   - Comprobar validación de datos

## 📞 Soporte

### Contacto
- **WhatsApp**: +593 98 784 3771
- **Email**: info@latierrita.com
- **Facebook**: @latierrita.shop
- **Instagram**: @latierrita.shop

### Documentación Técnica
Para más detalles técnicos, revisar los comentarios en el código fuente.

## 📄 Licencia

Este proyecto está licenciado bajo MIT License.

---

**La Tierrita** - Bocaditos tradicionales del campo ecuatoriano 🌾

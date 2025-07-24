# La Tierrita - E-commerce con PayPal

Sistema de e-commerce completo para La Tierrita con integración de PayPal Standard Checkout.

## 🚀 Características

- ✅ Catálogo de productos con categorías (Tradicionales/Gourmet)
- ✅ Carrito de compras funcional
- ✅ Filtros por categoría
- ✅ Integración completa con PayPal
- ✅ Interfaz responsive
- ✅ Persistencia del carrito en localStorage
- ✅ Backend Node.js/Express
- ✅ Manejo de errores y estados de carga

## 📋 Requisitos Previos

- Node.js (versión 14 o superior)
- npm o yarn
- Cuenta de PayPal Developer (para obtener credenciales)

## 🛠️ Instalación y Configuración

### 1. Clonar y configurar dependencias

```bash
# Instalar dependencias
npm install

# O si usas yarn
yarn install
```

### 2. Configurar variables de entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env con tus credenciales de PayPal
```

Editar el archivo `.env` con tus credenciales:

```env
# Para desarrollo (Sandbox)
PAYPAL_CLIENT_ID=tu-sandbox-client-id
PAYPAL_CLIENT_SECRET=tu-sandbox-client-secret

# Configuración del servidor
PORT=3000
NODE_ENV=development
```

### 3. Obtener credenciales de PayPal

1. Ve a [PayPal Developer](https://developer.paypal.com/)
2. Inicia sesión o crea una cuenta
3. Ve a "My Apps & Credentials"
4. Crea una nueva aplicación para Sandbox
5. Copia el `Client ID` y `Client Secret`
6. Pégalos en tu archivo `.env`

### 4. Iniciar el servidor

```bash
# Modo desarrollo
npm run dev

# Modo producción
npm start
```

## 🌐 Uso

1. **Frontend**: Visita `http://localhost:3000`
2. **Página de productos**: `http://localhost:3000/productos`
3. **API Health**: `http://localhost:3000/api/health`

### Flujo de compra:

1. Navega a la página de productos
2. Usa los filtros para ver categorías específicas
3. Selecciona cantidad y agrega productos al carrito
4. Haz clic en el icono del carrito para ver tu pedido
5. Usa el botón de PayPal para proceder al pago
6. Completa el pago en PayPal
7. Recibe confirmación de compra exitosa

## 🔧 Configuración de PayPal

### Variables del Frontend

En `productos.html`, asegúrate de que el script de PayPal use el client ID correcto:

```html
<!-- Para Sandbox -->
<script src="https://www.paypal.com/sdk/js?client-id=sb&currency=USD&components=buttons"></script>

<!-- Para producción -->
<script src="https://www.paypal.com/sdk/js?client-id=TU-CLIENT-ID-REAL&currency=USD&components=buttons"></script>
```

### Configuración del Backend

El backend detecta automáticamente el entorno:

- **development**: Usa PayPal Sandbox
- **production**: Usa PayPal Live

## 🚀 Pasar a Producción

### 1. Obtener credenciales de producción

1. En PayPal Developer, cambia a "Live"
2. Crea una nueva aplicación para Live
3. Obtén las nuevas credenciales

### 2. Actualizar configuración

```env
# Archivo .env para producción
PAYPAL_CLIENT_ID=tu-live-client-id
PAYPAL_CLIENT_SECRET=tu-live-client-secret
NODE_ENV=production
PORT=3000
```

### 3. Actualizar frontend

En `productos.html`, cambia el client ID:

```html
<script src="https://www.paypal.com/sdk/js?client-id=TU-CLIENT-ID-LIVE&currency=USD&components=buttons"></script>
```

### 4. Deploy

```bash
# Instalar dependencias para producción
npm install --production

# Iniciar servidor
npm start
```

## 📁 Estructura del Proyecto

```
.
├── index.html          # Página principal
├── productos.html      # Página de productos
├── style.css          # Estilos principales
├── carrito.js         # Lógica del carrito y PayPal
├── server.js          # Backend Express
├── package.json       # Dependencias Node.js
├── .env.example       # Ejemplo de variables de entorno
└── README.md          # Esta documentación
```

## 🔌 API Endpoints

### POST `/api/orders`

Crear una nueva orden de PayPal

- **Body**: Datos de la orden (items, total, etc.)
- **Response**: ID de la orden creada

### POST `/api/orders/:orderID/capture`

Capturar/finalizar una orden de PayPal

- **Params**: `orderID` - ID de la orden a capturar
- **Response**: Datos de la transacción completada

### GET `/api/orders/:orderID`

Obtener detalles de una orden

- **Params**: `orderID` - ID de la orden
- **Response**: Detalles completos de la orden

### GET `/api/health`

Verificar estado del servidor

- **Response**: Estado del servidor y configuración

## 🛡️ Seguridad

- ✅ Client Secret nunca se expone en el frontend
- ✅ Todas las transacciones se validan en el backend
- ✅ Autenticación con PayPal usando Basic Auth
- ✅ Manejo de errores robusto
- ✅ Variables de entorno para credenciales

## 🐛 Solución de Problemas

### Error: "Client ID no válido"

- Verifica que estés usando las credenciales correctas (Sandbox vs Live)
- Asegúrate de que el `.env` esté configurado correctamente

### Error: "CORS"

- El backend ya incluye configuración CORS
- Verifica que el frontend esté haciendo llamadas a la URL correcta

### PayPal no carga

- Verifica tu conexión a internet
- Comprueba la consola del navegador para errores
- Asegúrate de que el script de PayPal se carga correctamente

### Orden no se completa

- Revisa los logs del servidor
- Verifica que la orden se creó correctamente
- Comprueba la configuración de PayPal

## 🧪 Testing

### Cuentas de prueba de PayPal

Para testing en Sandbox, puedes usar estas cuentas de prueba:

- **Comprador**: `buyer@example.com` / `password123`
- **Vendedor**: Tu cuenta de PayPal Sandbox

### Tarjetas de prueba

PayPal proporciona tarjetas de prueba para Sandbox.

## 📞 Soporte

Para problemas específicos:

1. Revisa los logs del servidor
2. Verifica la configuración de PayPal
3. Consulta la documentación de PayPal Developer
4. Revisa las variables de entorno

## 📄 Licencia

MIT License - Ver archivo LICENSE para más detalles.

---

**Desarrollado para La Tierrita** 🌱

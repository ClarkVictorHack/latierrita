# Configuración de EmailJS para el Formulario de Distribuidores - La Tierrita

## Estado Actual

✅ **Implementación completada**: Se ha agregado toda la funcionalidad del formulario de distribuidores con integración EmailJS al archivo `main.js`.

✅ **Configuración completada**: EmailJS está configurado con las credenciales reales de La Tierrita.

### Credenciales Configuradas:

- **Service ID**: `service_1ylo4ll`
- **Template ID**: `template_5zoc2e4`
- **Public Key**: `KsWcM0Owsw__6IAUT`

⚠️ **Pendiente**: Configurar el template en EmailJS con el formato proporcionado.

## Pasos para Completar la Configuración

### 1. Crear Cuenta en EmailJS

1. Ve a [EmailJS.com](https://www.emailjs.com/)
2. Crea una cuenta gratuita (permite hasta 200 emails/mes)
3. Verifica tu email

### 2. Configurar Servicio de Email

1. En el dashboard de EmailJS, ve a **"Email Services"**
2. Haz clic en **"Add New Service"**
3. Selecciona tu proveedor de email (Gmail, Outlook, etc.)
4. Sigue las instrucciones para conectar tu cuenta
5. **Copia el Service ID** que se genera

### 3. Crear Template de Email

1. Ve a **"Email Templates"**
2. Haz clic en **"Create New Template"**
3. Usa este template como base:

```html
Asunto: Nuevo Distribuidor Interesado: {{full_name}} Contenido: {{message}} ---
Enviado desde: {{from_email}} Fecha: {{fecha_envio}}
```

4. **Copia el Template ID** que se genera

### 4. Obtener User ID

1. Ve a **"Account"** → **"General"**
2. **Copia tu User ID** (también llamado Public Key)

### 5. Actualizar el Código

Edita el archivo `main.js` y reemplaza estas líneas:

```javascript
// Línea ~867: Reemplazar con tu User ID real
emailjs.init("user_YOUR_USER_ID");

// Líneas ~982-983: Reemplazar con tus IDs reales
const serviceID = "service_YOUR_SERVICE_ID";
const templateID = "template_YOUR_TEMPLATE_ID";
```

**Ejemplo de configuración completa:**

```javascript
emailjs.init("user_abcd1234efgh5678");
const serviceID = "service_gmail123";
const templateID = "template_dist456";
```

## Funcionalidades Implementadas

### ✅ Validación Completa del Formulario

- Campos obligatorios: nombre, teléfono, email, ubicación
- Validación de formato de email
- Validación de formato de teléfono
- Validación de al menos un tipo de cliente seleccionado
- Validación en tiempo real (al escribir y al salir del campo)

### ✅ Recopilación de Datos

- **Información de contacto**: nombre, teléfono, email, ubicación, coordenadas GPS
- **Perfil comercial**: estado del negocio, nombre comercial, tipos de clientes
- **Capacidad y logística**: experiencia, equipos de congelación, método de entrega
- **Información adicional**: cómo conoció La Tierrita, motivación, comentarios

### ✅ Envío de Email Formateado

- Email estructurado con todas las secciones claramente organizadas
- Información de metadata (fecha, navegador)
- Formato visual atractivo con emojis y separadores

### ✅ Experiencia de Usuario

- Estados de carga durante el envío
- Mensajes de error específicos por campo
- Confirmación visual al enviar exitosamente
- Limpieza automática del formulario
- Notificaciones toast para feedback inmediato

### ✅ Manejo de Errores

- Validación antes del envío
- Manejo de errores de conexión
- Mensajes de error informativos
- Recuperación del estado del botón en caso de error

## Estructura del Email que se Enviará

```
NUEVO DISTRIBUIDOR INTERESADO - LA TIERRITA

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 INFORMACIÓN DE CONTACTO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 Nombre completo: [Nombre del distribuidor]
📱 Teléfono (WhatsApp): [Número de teléfono]
📧 Email: [Email del distribuidor]
📍 Ubicación: [Ciudad, Provincia]
🗺️ Coordenadas: [Lat, Lng]

[... más secciones ...]
```

## Testing

Para probar la funcionalidad:

1. **Completa la configuración** con tus credenciales de EmailJS
2. **Abre el sitio web** en un navegador
3. **Navega al formulario** de distribuidores
4. **Llena todos los campos** obligatorios
5. **Envía el formulario** y verifica:
   - Que aparezca el mensaje de "Enviando..."
   - Que se muestre la página de confirmación
   - Que recibas el email en tu bandeja de entrada

## Troubleshooting

### Error: "EmailJS no está cargado"

- Verifica que el script de EmailJS esté cargando correctamente en `index.html`
- Comprueba la consola del navegador para errores de red

### Error: "Service not found"

- Verifica que el Service ID sea correcto
- Asegúrate de que el servicio esté configurado y activo en EmailJS

### Error: "Template not found"

- Verifica que el Template ID sea correcto
- Asegúrate de que el template esté publicado en EmailJS

### No se recibe el email

- Revisa la carpeta de spam
- Verifica que la dirección "To" esté configurada correctamente en el template
- Comprueba los límites de tu cuenta EmailJS

## Seguridad

- ✅ Los IDs de EmailJS son públicos por diseño (van en el frontend)
- ✅ La validación se hace tanto en frontend como en el servicio EmailJS
- ✅ No se exponen credenciales sensibles
- ✅ EmailJS maneja la autenticación de forma segura

## Próximos Pasos

1. **Configurar EmailJS** con las credenciales reales
2. **Personalizar el template** de email según tus preferencias
3. **Probar el formulario** completamente
4. **Configurar notificaciones** adicionales si es necesario
5. **Considerar backup** de los datos en una base de datos (opcional)

---

**Fecha de implementación**: Diciembre 2024  
**Estado**: ✅ Código implementado, ⚠️ Configuración pendiente  
**Prioridad**: Alta - Funcionalidad crítica para el negocio

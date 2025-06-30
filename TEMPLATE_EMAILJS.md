# Template de EmailJS para Formulario de Distribuidores

## Configuración del Template en EmailJS

### Asunto del Email

```
Nuevo Distribuidor Interesado: {{full_name}}
```

### Contenido del Email (HTML)

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
      }
      .header {
        background: linear-gradient(135deg, #d79f49, #8b7355);
        color: white;
        padding: 20px;
        text-align: center;
        border-radius: 8px;
        margin-bottom: 20px;
      }
      .section {
        background: #f8f9fa;
        padding: 15px;
        margin: 15px 0;
        border-left: 4px solid #d79f49;
        border-radius: 4px;
      }
      .section h3 {
        color: #8b7355;
        margin-top: 0;
      }
      .info-grid {
        display: grid;
        grid-template-columns: 1fr 2fr;
        gap: 10px;
        margin: 10px 0;
      }
      .label {
        font-weight: bold;
        color: #666;
      }
      .value {
        color: #333;
      }
      .footer {
        background: #8b7355;
        color: white;
        padding: 15px;
        text-align: center;
        border-radius: 4px;
        margin-top: 20px;
        font-size: 14px;
      }
      .coordinates {
        font-family: monospace;
        background: #e9ecef;
        padding: 5px;
        border-radius: 3px;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>🌾 Nuevo Distribuidor Interesado</h1>
      <h2>La Tierrita</h2>
    </div>

    <div class="section">
      <h3>📋 Información de Contacto</h3>
      <div class="info-grid">
        <span class="label">👤 Nombre completo:</span>
        <span class="value">{{full_name}}</span>

        <span class="label">📱 Teléfono (WhatsApp):</span>
        <span class="value">{{phone}}</span>

        <span class="label">📧 Email:</span>
        <span class="value">{{email}}</span>

        <span class="label">📍 Ubicación:</span>
        <span class="value">{{location}}</span>

        <span class="label">🗺️ Coordenadas:</span>
        <span class="value coordinates">{{coordinates}}</span>
      </div>
    </div>

    <div class="section">
      <h3>🏢 Perfil Comercial</h3>
      <div class="info-grid">
        <span class="label">💼 Estado del negocio:</span>
        <span class="value">{{business_status}}</span>

        <span class="label">🏪 Nombre comercial:</span>
        <span class="value">{{business_name}}</span>

        <span class="label">🎯 Tipos de clientes objetivo:</span>
        <span class="value">{{customer_types}}</span>
      </div>
    </div>

    <div class="section">
      <h3>🚚 Capacidad y Logística</h3>
      <div class="info-grid">
        <span class="label">📈 Experiencia en alimentos:</span>
        <span class="value">{{experience}}</span>

        <span class="label">❄️ Equipos de congelación:</span>
        <span class="value">{{freezer_status}}</span>

        <span class="label">🚛 Método de entrega:</span>
        <span class="value">{{delivery}}</span>
      </div>
    </div>

    <div class="section">
      <h3>💭 Conociéndonos Mejor</h3>
      <div class="info-grid">
        <span class="label">🤝 Cómo conoció La Tierrita:</span>
        <span class="value">{{how_you_know}}</span>

        <span class="label">💡 Por qué quiere distribuir:</span>
        <span class="value">{{why_distribute}}</span>

        <span class="label">💬 Comentarios adicionales:</span>
        <span class="value">{{comments}}</span>
      </div>
    </div>

    <div class="footer">
      <p><strong>📅 Fecha de envío:</strong> {{fecha_envio}}</p>
      <p>
        Este mensaje fue enviado automáticamente desde el formulario de
        distribuidores de <strong>latierrita.com</strong>
      </p>
      <p style="margin-top: 15px;">
        <strong>🌾 La Tierrita</strong><br />
        Bocaditos tradicionales del campo ecuatoriano
      </p>
    </div>
  </body>
</html>
```

### Contenido del Email (Texto Plano - Fallback)

```
NUEVO DISTRIBUIDOR INTERESADO - LA TIERRITA

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 INFORMACIÓN DE CONTACTO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 Nombre completo: {{full_name}}
📱 Teléfono (WhatsApp): {{phone}}
📧 Email: {{email}}
📍 Ubicación: {{location}}
🗺️ Coordenadas: {{coordinates}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏢 PERFIL COMERCIAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💼 Estado del negocio: {{business_status}}
🏪 Nombre comercial: {{business_name}}
🎯 Tipos de clientes objetivo: {{customer_types}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚚 CAPACIDAD Y LOGÍSTICA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 Experiencia en alimentos: {{experience}}
❄️ Equipos de congelación: {{freezer_status}}
🚛 Método de entrega: {{delivery}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💭 CONOCIÉNDONOS MEJOR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🤝 Cómo conoció La Tierrita: {{how_you_know}}

💡 Por qué quiere distribuir: {{why_distribute}}

💬 Comentarios adicionales: {{comments}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 INFORMACIÓN DEL ENVÍO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🕐 Fecha y hora: {{fecha_envio}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Este mensaje fue enviado automáticamente desde el formulario de distribuidores de latierrita.com
```

## Variables Disponibles en el Template

### Información de Contacto

- `{{full_name}}` - Nombre completo
- `{{phone}}` - Número de teléfono
- `{{email}}` - Email del distribuidor
- `{{location}}` - Ciudad y provincia
- `{{coordinates}}` - Coordenadas GPS

### Perfil Comercial

- `{{business_status}}` - Estado del negocio
- `{{business_name}}` - Nombre comercial
- `{{customer_types}}` - Tipos de clientes objetivo

### Capacidad y Logística

- `{{experience}}` - Experiencia en alimentos
- `{{freezer_status}}` - Estado de equipos de congelación
- `{{delivery}}` - Método de entrega

### Información Adicional

- `{{how_you_know}}` - Cómo conoció La Tierrita
- `{{why_distribute}}` - Motivación para distribuir
- `{{comments}}` - Comentarios adicionales

### Metadata

- `{{fecha_envio}}` - Fecha y hora del envío
- `{{from_email}}` - Email del remitente (para Reply-To)
- `{{from_name}}` - Nombre del remitente

## Configuración en EmailJS

1. **Crear nuevo template** en EmailJS
2. **Copiar el contenido HTML** en la sección "Content"
3. **Copiar el contenido de texto plano** en la sección "Text" (opcional pero recomendado)
4. **Configurar el asunto** con la variable `{{full_name}}`
5. **Configurar el "To Email"** con tu email de La Tierrita
6. **Configurar "Reply To"** con `{{email}}` para poder responder directamente al distribuidor
7. **Guardar y obtener el Template ID**

## Resultado

El email que recibirás tendrá:

- ✅ Diseño profesional con colores de la marca
- ✅ Información organizada por secciones
- ✅ Fácil lectura y navegación
- ✅ Capacidad de responder directamente al distribuidor
- ✅ Toda la información necesaria para evaluar al candidato

Este template asegura que recibas toda la información del formulario de manera organizada y profesional.

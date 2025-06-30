// EJEMPLO DE CONFIGURACIÓN REAL DE PAYPAL
// Copia este archivo como 'paypal-config.js' y personaliza con tus datos

const PAYPAL_CONFIG = {
    // 🔑 CREDENCIALES DE PAYPAL
    // Reemplaza con tu Client ID real de PayPal Developer Dashboard
    clientId: 'AYourRealClientIdFromPayPalDeveloperDashboard_1234567890',
    
    // 💰 CONFIGURACIÓN DE MONEDA
    currency: 'USD', // Recomendado para Ecuador: USD
    
    // 🌍 ENTORNO
    environment: 'sandbox', // Cambiar a 'production' para producción
    
    // 🏪 CONFIGURACIÓN DE MARCA
    brandName: 'La Tierrita',
    locale: 'es_EC',
    
    // 🔗 URLs DE RETORNO (actualizar con tu dominio real)
    returnUrl: 'https://latierrita.com/checkout.html?payment=success',
    cancelUrl: 'https://latierrita.com/checkout.html?payment=cancel',
    
    // 💳 MÉTODOS DE PAGO HABILITADOS
    enableFunding: ['venmo', 'paylater'],
    disableFunding: ['card'], // Opcional: deshabilitar tarjetas para forzar PayPal
    
    // 🎨 ESTILO DE BOTONES
    buttonStyle: {
        layout: 'vertical',      // 'horizontal' o 'vertical'
        color: 'gold',           // 'gold', 'blue', 'silver', 'white', 'black'
        shape: 'rect',           // 'rect' o 'pill'
        label: 'paypal',         // 'paypal', 'checkout', 'buynow', 'pay'
        height: 50,              // 25-55 pixels
        tagline: false           // Mostrar tagline "The safer, easier way to pay"
    },
    
    // ⚙️ CONFIGURACIÓN AVANZADA
    intent: 'capture',           // 'capture' o 'authorize'
    
    // 🚢 CONFIGURACIÓN DE ENVÍO
    shipping: {
        freeShippingThreshold: 50.00, // Envío gratis sobre $50
        defaultShippingCost: 5.00,    // Costo de envío estándar
        currency: 'USD'
    },
    
    // 🏷️ CONFIGURACIÓN DE CUPONES
    coupons: {
        'BIENVENIDO10': 0.10,  // 10% de descuento
        'FAMILIA15': 0.15,     // 15% de descuento
        'TIERRITA20': 0.20     // 20% de descuento
    }
};

// Función para validar configuración
function validatePayPalConfig() {
    if (!PAYPAL_CONFIG.clientId || PAYPAL_CONFIG.clientId.includes('TU_CLIENT_ID')) {
        console.warn('⚠️ ATENCIÓN: Necesitas configurar tu Client ID real de PayPal');
        console.info('📖 Instrucciones: https://developer.paypal.com/developer/applications');
        return false;
    }
    
    if (PAYPAL_CONFIG.environment === 'production' && PAYPAL_CONFIG.clientId.includes('sandbox')) {
        console.error('❌ ERROR: Client ID de sandbox en ambiente de producción');
        return false;
    }
    
    console.log('✅ Configuración de PayPal válida');
    return true;
}

// Función para obtener configuración del SDK
function getPayPalSDKUrl() {
    const params = new URLSearchParams({
        'client-id': PAYPAL_CONFIG.clientId,
        'currency': PAYPAL_CONFIG.currency,
        'components': 'buttons',
        'enable-funding': PAYPAL_CONFIG.enableFunding.join(','),
        'locale': PAYPAL_CONFIG.locale
    });
    
    if (PAYPAL_CONFIG.disableFunding.length > 0) {
        params.append('disable-funding', PAYPAL_CONFIG.disableFunding.join(','));
    }
    
    return `https://www.paypal.com/sdk/js?${params.toString()}`;
}

// Exportar configuración para Node.js (si aplica)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PAYPAL_CONFIG;
}

/* 
INSTRUCCIONES RÁPIDAS:

1. Obtén tu Client ID de PayPal:
   - Ve a https://developer.paypal.com/
   - Crea una aplicación REST API
   - Copia el Client ID

2. Reemplaza el clientId arriba con tu ID real

3. Para pruebas:
   - Mantén environment: 'sandbox'
   - Usa cuentas de prueba de PayPal

4. Para producción:
   - Cambia environment: 'production'
   - Usa tu Client ID de producción
   - Actualiza las URLs de retorno

5. Personaliza colores y estilos según tu marca

¡Tu integración de PayPal estará lista! 🚀
*/

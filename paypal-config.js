// PayPal Configuration for La Tierrita
// Credenciales reales de PayPal configuradas

const PAYPAL_CONFIG = {
    // ✅ Client ID real de PayPal configurado
    clientId: 'BAA9dIdaO89f8zanzO-8S1Rsz7F7Vx16kiP2IfcmjZhonAuzDpwE8MPgz0CHZr4f0vAgIGj95q-CqJYxho',
    
    // Configuración de moneda
    currency: 'USD', // USD para Ecuador
    
    // Configuración de entorno
    environment: 'sandbox', // Cambiar a 'production' cuando esté listo para producción
    
    // Configuración de la aplicación
    brandName: 'La Tierrita',
    locale: 'es_EC',
    
    // URLs de retorno (actualizar con tu dominio real en producción)
    returnUrl: window.location.origin + '/checkout.html?payment=success',
    cancelUrl: window.location.origin + '/checkout.html?payment=cancel',
    
    // Configuración de métodos de pago habilitados
    enableFunding: ['venmo', 'paylater'],
    disableFunding: [], // Puedes deshabilitar métodos específicos aquí si es necesario
    
    // Configuración de estilo de botones
    buttonStyle: {
        layout: 'vertical',
        color: 'gold',
        shape: 'rect',
        label: 'paypal',
        height: 50,
        tagline: false
    }
};

// Función para validar configuración
function validatePayPalConfig() {
    if (!PAYPAL_CONFIG.clientId || PAYPAL_CONFIG.clientId === 'TU_CLIENT_ID_AQUI') {
        console.warn('⚠️ ATENCIÓN: Necesitas configurar tu Client ID real de PayPal');
        return false;
    }
    
    // Validar que el Client ID tenga el formato correcto de PayPal
    if (!PAYPAL_CONFIG.clientId.startsWith('BA') || PAYPAL_CONFIG.clientId.length < 50) {
        console.warn('⚠️ ATENCIÓN: El Client ID no parece tener el formato correcto de PayPal');
        return false;
    }
    
    console.log('✅ Configuración de PayPal válida - Client ID configurado correctamente');
    return true;
}

// Función para obtener la URL del SDK de PayPal
function getPayPalSDKUrl() {
    const params = new URLSearchParams({
        'client-id': PAYPAL_CONFIG.clientId,
        'currency': PAYPAL_CONFIG.currency,
        'components': 'buttons',
        'locale': PAYPAL_CONFIG.locale
    });
    
    if (PAYPAL_CONFIG.enableFunding && PAYPAL_CONFIG.enableFunding.length > 0) {
        params.append('enable-funding', PAYPAL_CONFIG.enableFunding.join(','));
    }
    
    if (PAYPAL_CONFIG.disableFunding && PAYPAL_CONFIG.disableFunding.length > 0) {
        params.append('disable-funding', PAYPAL_CONFIG.disableFunding.join(','));
    }
    
    return `https://www.paypal.com/sdk/js?${params.toString()}`;
}

// Exportar configuración
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PAYPAL_CONFIG;
}

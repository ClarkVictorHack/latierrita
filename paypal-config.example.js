// Ejemplo de configuración básica de PayPal
// Copia este archivo como 'paypal-config.js' y reemplaza con tu Client ID real

const PAYPAL_CLIENT_ID = 'TU_CLIENT_ID';

function loadPayPalSdk(callback) {
    if (typeof PAYPAL_CLIENT_ID === 'undefined' || PAYPAL_CLIENT_ID === 'TU_CLIENT_ID') {
        console.warn('Configura PAYPAL_CLIENT_ID en paypal-config.js');
        return;
    }
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`;
    script.onload = callback;
    document.head.appendChild(script);
}

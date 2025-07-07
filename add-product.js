function initPayPal() {
    if (typeof paypal === 'undefined') {
        console.error('PayPal SDK no cargado');
        return;
    }

    paypal.Buttons({
        createOrder: function(data, actions) {
            var nombre = document.getElementById('nombre').value || 'Producto';
            var precio = parseFloat(document.getElementById('precio').value || '0');
            return fetch('/api/paypal/crear-orden.php', {
                method: 'post',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ producto: { nombre: nombre, precio: precio } })
            }).then(function(res) { return res.json(); })
              .then(function(orderData) { return orderData.id; });
        },
        onApprove: function(data, actions) {
            return fetch('/api/paypal/capturar-orden.php', {
                method: 'post',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ orderID: data.orderID })
            }).then(function(res) { return res.json(); })
              .then(function(details) {
                  alert('Pago completado');
              });
        },
        onError: function(err) {
            console.error('PayPal Error:', err);
            alert('No se pudo procesar el pago');
        }
    }).render('#paypal-button-container');
}

// Cargar SDK y renderizar botones
loadPayPalSdk(initPayPal);

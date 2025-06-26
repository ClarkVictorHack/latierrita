// checkout.js - Lógica para la página de checkout de La Tierrita
// Cumple con los requisitos de Google Merchant Center

document.addEventListener('DOMContentLoaded', function() {
    // Cargar datos del carrito desde localStorage
    loadCartData();
    
    // Verificar que el carrito no esté vacío
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        // Redirigir si el carrito está vacío
        alert('Tu carrito está vacío. Serás redirigido a la página principal.');
        window.location.href = 'index.html';
        return;
    }
    
    // Event listeners con verificación de existencia
    const checkoutForm = document.getElementById('checkout-form');
    const applyCouponBtn = document.getElementById('applyCoupon');
    const closeConfirmationBtn = document.getElementById('close-confirmation');
    
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleFormSubmit);
    }
    
    if (applyCouponBtn) {
        applyCouponBtn.addEventListener('click', applyCoupon);
    }
    
    if (closeConfirmationBtn) {
        closeConfirmationBtn.addEventListener('click', closeConfirmation);
    }
    
    // Botón de prueba temporal
    const testModalBtn = document.getElementById('test-modal-btn');
    if (testModalBtn) {
        testModalBtn.addEventListener('click', function() {
            document.getElementById('order-number').textContent = 'TEST123456';
            document.getElementById('order-confirmation-modal').classList.remove('hidden');
        });
    }
    
    // Validación en tiempo real
    setupRealTimeValidation();
    
    // Google Analytics Events
    setupAnalyticsTracking();
    
    console.log('Checkout inicializado correctamente');
});

// Datos de productos (sincronizado con main.js)
const productos = [
    {
        id: 3,
        nombre: "Mini Bolón de Verde",
        categoria: "Bocaditos Tradicionales",
        imagen: "img/mini bolon de verde.png",
        precio: 3.50,
        peso: "500g"
    },
    {
        id: 4,
        nombre: "Mini Bolón de Maduro",
        categoria: "Bocaditos Tradicionales", 
        imagen: "img/mini bolon de maduro.png",
        precio: 3.50,
        peso: "500g"
    },
    {
        id: 6,
        nombre: "Pan de Yuca",
        categoria: "Bocaditos Tradicionales",
        imagen: "img/pan de yuca.png",
        precio: 4.00,
        peso: "500g"
    },
    {
        id: 5,
        nombre: "Mini Muchín",
        categoria: "Bocaditos Tradicionales",
        imagen: "img/mini muchin.png",
        precio: 3.00,
        peso: "500g"
    }
];

// Cargar datos del carrito
function loadCartData() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const checkoutItems = document.getElementById('checkout-items');
    
    if (cart.length === 0) {
        // Redirect to main page if cart is empty
        window.location.href = 'index.html#productos';
        return;
    }
    
    let subtotal = 0;
    checkoutItems.innerHTML = '';
    
    cart.forEach(item => {
        const producto = productos.find(p => p.id === item.id);
        if (producto) {
            const itemTotal = producto.precio * item.quantity;
            subtotal += itemTotal;
            
            checkoutItems.innerHTML += `
                <div class="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <img src="${producto.imagen}" alt="${producto.nombre}" 
                         class="w-16 h-16 object-cover rounded-lg">
                    <div class="flex-1">
                        <h3 class="font-medium text-gray-900">${producto.nombre}</h3>
                        <p class="text-sm text-gray-500">${producto.peso}</p>
                        <p class="text-sm text-gray-600">Cantidad: ${item.quantity}</p>
                    </div>
                    <div class="text-right">
                        <p class="font-medium text-gray-900">$${itemTotal.toFixed(2)}</p>
                        <p class="text-sm text-gray-500">$${producto.precio.toFixed(2)} c/u</p>
                    </div>
                </div>
            `;
        }
    });
    
    updateOrderSummary(subtotal);
    
    // Google Analytics - Begin Checkout Event
    gtag('event', 'begin_checkout', {
        currency: 'USD',
        value: subtotal,
        items: cart.map(item => {
            const producto = productos.find(p => p.id === item.id);
            return {
                item_id: producto.id,
                item_name: producto.nombre,
                category: producto.categoria,
                quantity: item.quantity,
                price: producto.precio
            };
        })
    });
}

// Actualizar resumen del pedido
function updateOrderSummary(subtotal) {
    const shipping = subtotal >= 50 ? 0 : 5.00;
    const discount = parseFloat(document.getElementById('discount').textContent.replace('-$', '')) || 0;
    const total = subtotal + shipping - discount;
    
    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('shipping').textContent = shipping === 0 ? 'GRATIS' : `$${shipping.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
    
    // Mostrar mensaje de envío gratis
    if (subtotal >= 50) {
        document.getElementById('shipping').innerHTML = '<span class="text-green-600 font-medium">GRATIS</span>';
    }
}

// Aplicar cupón de descuento
function applyCoupon() {
    const couponCode = document.getElementById('couponCode').value.trim().toLowerCase();
    const discountRow = document.getElementById('discount-row');
    const discountAmount = document.getElementById('discount');
    
    const validCoupons = {
        'bienvenido10': 0.10,
        'familia15': 0.15,
        'tierrita20': 0.20
    };
    
    if (validCoupons[couponCode]) {
        const subtotal = parseFloat(document.getElementById('subtotal').textContent.replace('$', ''));
        const discount = subtotal * validCoupons[couponCode];
        
        discountAmount.textContent = `-$${discount.toFixed(2)}`;
        discountRow.classList.remove('hidden');
        
        updateOrderSummary(subtotal);
        
        // Show success message
        showNotification('¡Cupón aplicado exitosamente!', 'success');
        
        // Google Analytics - Coupon Event
        gtag('event', 'coupon_applied', {
            coupon: couponCode,
            discount_amount: discount
        });
    } else {
        showNotification('Código de cupón inválido', 'error');
    }
}

// Manejar envío del formulario
function handleFormSubmit(e) {
    e.preventDefault();
    console.log('Formulario enviado');
    
    // Validar formulario
    if (!validateForm()) {
        console.log('Validación del formulario falló');
        return;
    }
    
    console.log('Formulario válido, procesando...');
    
    // Obtener datos del formulario
    const formData = new FormData(e.target);
    const orderData = Object.fromEntries(formData);
    
    // Agregar datos del carrito
    orderData.cart = JSON.parse(localStorage.getItem('cart')) || [];
    orderData.total = document.getElementById('total').textContent;
    orderData.orderNumber = generateOrderNumber();
    orderData.timestamp = new Date().toISOString();
    
    console.log('Datos del pedido:', orderData);
    
    // Simular procesamiento del pedido
    showLoadingState();
    
    setTimeout(() => {
        processOrder(orderData);
    }, 2000);
}

// Procesar pedido
function processOrder(orderData) {
    // Guardar pedido en localStorage (en producción sería una API)
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(orderData);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Limpiar carrito
    localStorage.removeItem('cart');
    
    // Mostrar confirmación
    document.getElementById('order-number').textContent = orderData.orderNumber;
    document.getElementById('order-confirmation-modal').classList.remove('hidden');
    
    // Google Analytics - Purchase Event
    const cart = orderData.cart;
    const total = parseFloat(orderData.total.replace('$', ''));
    
    gtag('event', 'purchase', {
        transaction_id: orderData.orderNumber,
        currency: 'USD',
        value: total,
        items: cart.map(item => {
            const producto = productos.find(p => p.id === item.id);
            return {
                item_id: producto.id,
                item_name: producto.nombre,
                category: producto.categoria,
                quantity: item.quantity,
                price: producto.precio
            };
        })
    });
    
    hideLoadingState();
    
    // Enviar datos por WhatsApp (opcional)
    prepareWhatsAppMessage(orderData);
}

// Preparar mensaje de WhatsApp
function prepareWhatsAppMessage(orderData) {
    const phoneNumber = '+593XXXXXXXXX'; // Reemplazar con número real
    let message = `🛒 *NUEVO PEDIDO - LA TIERRITA*\n\n`;
    message += `📋 *Pedido #:* ${orderData.orderNumber}\n`;
    message += `👤 *Cliente:* ${orderData.firstName} ${orderData.lastName}\n`;
    message += `📞 *Teléfono:* ${orderData.phone}\n`;
    message += `📧 *Email:* ${orderData.email}\n\n`;
    message += `📦 *Dirección de envío:*\n${orderData.address}\n${orderData.city}, ${orderData.province}\n\n`;
    message += `🛍️ *Productos:*\n`;
    
    orderData.cart.forEach(item => {
        const producto = productos.find(p => p.id === item.id);
        message += `• ${producto.nombre} x${item.quantity} - $${(producto.precio * item.quantity).toFixed(2)}\n`;
    });
    
    message += `\n💰 *Total:* ${orderData.total}\n`;
    message += `💳 *Método de pago:* ${getPaymentMethodText(orderData.paymentMethod)}\n\n`;
    
    if (orderData.deliveryNotes) {
        message += `📝 *Notas:* ${orderData.deliveryNotes}\n\n`;
    }
    
    message += `⏰ *Fecha:* ${new Date().toLocaleString('es-EC')}\n\n`;
    message += `¡Gracias por elegir La Tierrita! 🌱`;
    
    // Crear enlace de WhatsApp
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    // Guardar para uso posterior
    localStorage.setItem('lastWhatsAppMessage', whatsappUrl);
}

// Validar formulario
function validateForm() {
    const requiredFields = [
        'firstName', 'lastName', 'email', 'phone', 
        'address', 'city', 'province'
    ];
    
    let isValid = true;
    
    requiredFields.forEach(fieldName => {
        const field = document.getElementById(fieldName);
        if (!field.value.trim()) {
            showFieldError(field, 'Este campo es obligatorio');
            isValid = false;
        } else {
            clearFieldError(field);
        }
    });
    
    // Validar email
    const email = document.getElementById('email');
    if (email.value && !isValidEmail(email.value)) {
        showFieldError(email, 'Ingresa un email válido');
        isValid = false;
    }
    
    // Validar términos y condiciones
    const termsAccepted = document.getElementById('termsAccepted');
    if (!termsAccepted.checked) {
        showNotification('Debes aceptar los términos y condiciones', 'error');
        isValid = false;
    }
    
    return isValid;
}

// Validación en tiempo real
function setupRealTimeValidation() {
    const emailField = document.getElementById('email');
    emailField.addEventListener('blur', function() {
        if (this.value && !isValidEmail(this.value)) {
            showFieldError(this, 'Ingresa un email válido');
        } else {
            clearFieldError(this);
        }
    });
    
    const phoneField = document.getElementById('phone');
    phoneField.addEventListener('input', function() {
        // Solo permitir números y algunos caracteres especiales
        this.value = this.value.replace(/[^0-9+\-\s()]/g, '');
    });
}

// Utilidades de validación
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showFieldError(field, message) {
    clearFieldError(field);
    field.classList.add('border-red-500');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'text-red-500 text-sm mt-1';
    errorDiv.textContent = message;
    field.parentNode.appendChild(errorDiv);
}

function clearFieldError(field) {
    field.classList.remove('border-red-500');
    const errorDiv = field.parentNode.querySelector('.text-red-500');
    if (errorDiv) {
        errorDiv.remove();
    }
}

// Mostrar notificaciones
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
        type === 'success' ? 'bg-green-500 text-white' :
        type === 'error' ? 'bg-red-500 text-white' :
        'bg-blue-500 text-white'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Estados de carga
function showLoadingState() {
    const button = document.getElementById('place-order-btn');
    button.disabled = true;
    button.innerHTML = `
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Procesando Pedido...
    `;
}

function hideLoadingState() {
    const button = document.getElementById('place-order-btn');
    button.disabled = false;
    button.innerHTML = `
        <i class="fas fa-lock mr-2"></i>
        Finalizar Compra
    `;
}

// Cerrar modal de confirmación
function closeConfirmation() {
    const modal = document.getElementById('order-confirmation-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
    
    // Mostrar notificación de agradecimiento
    showNotification('¡Gracias por tu compra! Te contactaremos pronto.', 'success');
    
    // Redirigir a la página principal después de un breve delay
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

// Generar número de pedido
function generateOrderNumber() {
    const prefix = 'LT';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
}

// Obtener texto del método de pago
function getPaymentMethodText(method) {
    const methods = {
        'transfer': 'Transferencia Bancaria',
        'paypal': 'PayPal',
        'cash': 'Pago contra entrega'
    };
    return methods[method] || method;
}

// Configurar seguimiento de Analytics
function setupAnalyticsTracking() {
    // Track form interactions
    document.getElementById('checkout-form').addEventListener('focusin', function(e) {
        if (e.target.type === 'email') {
            gtag('event', 'email_focus', {
                event_category: 'checkout',
                event_label: 'email_field'
            });
        }
    });
    
    // Track payment method selection
    document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
        radio.addEventListener('change', function() {
            gtag('event', 'payment_method_selected', {
                event_category: 'checkout',
                event_label: this.value
            });
        });
    });
    
    // Track province selection
    document.getElementById('province').addEventListener('change', function() {
        gtag('event', 'province_selected', {
            event_category: 'checkout',
            event_label: this.value
        });
    });
}

// Verificar si hay productos en el carrito al cargar la página
window.addEventListener('beforeunload', function() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length > 0) {
        // Track checkout abandonment
        gtag('event', 'checkout_abandon', {
            event_category: 'ecommerce',
            value: parseFloat(document.getElementById('total').textContent.replace('$', ''))
        });
    }
});

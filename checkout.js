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
    
    // Verificar configuración de PayPal al inicio
    setTimeout(() => {
        if (!checkPayPalConfig()) {
            console.error('❌ PayPal no está correctamente configurado');
            showPayPalError('PayPal no disponible temporalmente. Por favor usa otro método de pago.');
        } else {
            console.log('✅ Configuración de PayPal verificada');
            // Cargar PayPal SDK dinámicamente y luego inicializar
            loadPayPalSDK().then(() => {
                initializePayPal();
            }).catch(error => {
                console.error('Error cargando PayPal:', error);
                showPayPalError('Error al cargar PayPal. Por favor recarga la página.');
            });
        }
    }, 200);
    
    // Event listeners con verificación de existencia
    const checkoutForm = document.getElementById('checkout-form');
    const applyCouponBtn = document.getElementById('applyCoupon');
    const closeConfirmationBtn = document.getElementById('close-confirmation');
    const contactWhatsAppBtn = document.getElementById('contact-whatsapp');
    
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleFormSubmit);
    }
    
    if (applyCouponBtn) {
        applyCouponBtn.addEventListener('click', applyCoupon);
    }
    
    if (closeConfirmationBtn) {
        closeConfirmationBtn.addEventListener('click', closeConfirmation);
    }
    
    if (contactWhatsAppBtn) {
        contactWhatsAppBtn.addEventListener('click', openWhatsApp);
    }
    
    // Event listeners para métodos de pago
    setupPaymentMethodListeners();
    
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
    // Bocaditos Tradicionales
    {
        id: 3,
        nombre: "Mini Bolón de Verde",
        categoria: "Bocaditos Tradicionales",
        imagen: "img/mini bolon de verde.png",
        descripcion: "Deliciosas bolitas de queso hechas con plátano cocinadas a la perfección.",
        precio: 3.50,
        peso: "500g",
        ingredientes: "Plátano, leche, sal, hierbita y queso."
    },
    {
        id: 4,
        nombre: "Mini Bolón de Maduro",
        categoria: "Bocaditos Tradicionales",
        imagen: "img/mini bolon de maduro.png",
        descripcion: "Hechos con plátano maduro cuidadosamente seleccionado mezclado con queso.",
        precio: 3.50,
        peso: "500g",
        ingredientes: "Maduro, grasa vegetal, sal y queso."
    },
    {
        id: 1,
        nombre: "Mini Muchin de Yuca",
        categoria: "Bocaditos Tradicionales",
        imagen: "img/mini muchin.png",
        descripcion: "¡Mini muchines, máximo sabor! Crujientes, con queso, y hechos 100% con yuca natural.",
        precio: 3.50,
        peso: "500g",
        ingredientes: "Yuca, sal y queso."
    },
    {
        id: 2,
        nombre: "Pan de Yuca",
        categoria: "Bocaditos Tradicionales",
        imagen: "img/pan de yuca.png",
        descripcion: "¡Ligereza y sabor en cada bocado! Panes suaves, crocantes y 100% sin gluten.",
        precio: 3.50,
        peso: "500g",
        ingredientes: "Almidón, queso, crema de leche, grasa vegetal, sal, agua."
    },
    // Bocaditos Gourmet
    {
        id: 6,
        nombre: "Maria Pipona de Maduro",
        categoria: "Bocaditos Gourmet",
        imagen: "img/maria pipona de maduro.jpg",
        descripcion: "Dulces, suaves y con un relleno irresistible de queso.",
        precio: 3.00,
        peso: "400g",
        ingredientes: "Maduro, sal, grasa vegetal y queso."
    },
    {
        id: 5,
        nombre: "Maria Pipona de Verde",
        categoria: "Bocaditos Gourmet",
        imagen: "img/maria pipona de verde.jpg",
        descripcion: "Hechas con plátano verde y rellenas de puro sabor, son perfectas para resolver el desayuno.",
        precio: 3.00,
        peso: "400g",
        ingredientes: "Verde, sal, grasa vegetal y queso."
    },
    {
        id: 7,
        nombre: "Muchines de Yuca",
        categoria: "Bocaditos Gourmet",
        imagen: "img/muchines de yuca.jpg",
        descripcion: "Crujientes por fuera, suaves por dentro. Hechos con yuca 100% natural y el toque perfecto de sal.",
        precio: 3.00,
        peso: "400g",
        ingredientes: "Yuca, sal y grasa vegetal."
    },
    {
        id: 8,
        nombre: "Torrejas",
        categoria: "Bocaditos Gourmet",
        imagen: "img/torrejas.jpg",
        descripcion: "Esponjosas y doradas, perfectas para acompañar con café o chocolate caliente.",
        precio: 3.00,
        peso: "400g",
        ingredientes: "Harina, huevo, leche, azúcar, sal."
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
            const itemTotal = producto.precio * item.cantidad;
            subtotal += itemTotal;
            
            checkoutItems.innerHTML += `
                <div class="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <img src="${producto.imagen}" alt="${producto.nombre}" 
                         class="w-16 h-16 object-cover rounded-lg">
                    <div class="flex-1">
                        <h3 class="font-medium text-gray-900">${producto.nombre}</h3>
                        <p class="text-sm text-gray-500">${producto.peso}</p>
                        <p class="text-sm text-gray-600">Cantidad: ${item.cantidad}</p>
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
                quantity: item.cantidad,
                price: producto.precio
            };
        })
    });
}

// Calcular costo de envío por provincia
function calculateShippingByProvince(province, subtotal) {
    // Envío gratis para compras mayores a $20
    if (subtotal >= 20) {
        return 0;
    }
    
    // Tarifas de envío por provincia
    const shippingRates = {
        'manabi': 3.00,           // Manabí (más barato por ser local)
        'guayas': 4.50,           // Guayas
        'pichincha': 4.50,        // Pichincha
        'azuay': 5.50,           // Azuay
        'el-oro': 5.50,          // El Oro
        'los-rios': 4.00,        // Los Ríos
        'santa-elena': 4.00,     // Santa Elena
        'esmeraldas': 5.00,      // Esmeraldas
        'santo-domingo': 4.50,   // Santo Domingo
        'cotopaxi': 5.00,        // Cotopaxi
        'tungurahua': 5.50,      // Tungurahua
        'chimborazo': 5.50,      // Bolívar
        'canar': 6.00,           // Cañar
        'carchi': 6.50,          // Carchi
        'imbabura': 5.50,        // Imbabura
        'loja': 6.50,            // Loja
        'morona-santiago': 7.00, // Morona Santiago
        'napo': 7.00,            // Napo
        'orellana': 7.50,        // Orellana
        'pastaza': 7.00,         // Pastaza
        'sucumbios': 7.50,       // Sucumbíos
        'zamora-chinchipe': 7.00, // Zamora Chinchipe
        'galapagos': 15.00       // Galápagos (especial)
    };
    
    return shippingRates[province] || 5.00; // Tarifa por defecto si no se encuentra la provincia
}

// Actualizar resumen del pedido
function updateOrderSummary(subtotal) {
    const provinceSelect = document.getElementById('province');
    const selectedProvince = provinceSelect ? provinceSelect.value : '';
    
    // Si no hay provincia seleccionada, mostrar mensaje
    if (!selectedProvince) {
        document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('shipping').innerHTML = '<span class="text-amber-600">Selecciona provincia</span>';
        document.getElementById('total').textContent = `$${subtotal.toFixed(2)}`;
        return;
    }
    
    const shipping = calculateShippingByProvince(selectedProvince, subtotal);
    const discount = parseFloat(document.getElementById('discount').textContent.replace('-$', '')) || 0;
    const total = subtotal + shipping - discount;
    
    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    
    // Mostrar costo de envío
    if (shipping === 0) {
        document.getElementById('shipping').innerHTML = '<span class="text-green-600 font-medium">GRATIS</span>';
    } else {
        document.getElementById('shipping').textContent = `$${shipping.toFixed(2)}`;
    }
    
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
    
    // Mostrar información de envío gratis
    updateShippingInfo(subtotal, shipping);
}

// Actualizar información de envío
function updateShippingInfo(subtotal, shipping) {
    const shippingInfoContainer = document.querySelector('.bg-blue-50');
    if (!shippingInfoContainer) return;
    
    const remainingForFree = 20 - subtotal;
    
    if (subtotal >= 20) {
        // Ya tiene envío gratis
        shippingInfoContainer.innerHTML = `
            <h3 class="font-medium text-green-900 mb-2 flex items-center">
                <i class="fas fa-check-circle mr-2" aria-hidden="true"></i>
                ¡Felicidades! Tienes envío gratis
            </h3>
            <ul class="text-sm text-green-800 space-y-1">
                <li>• Tiempo de entrega: 2-5 días hábiles</li>
                <li>• Productos congelados en empaques especiales</li>
                <li>• Confirmación por WhatsApp</li>
                <li>• Seguimiento del pedido</li>
            </ul>
        `;
    } else {
        // Mostrar cuánto falta para envío gratis
        shippingInfoContainer.innerHTML = `
            <h3 class="font-medium text-blue-900 mb-2 flex items-center">
                <i class="fas fa-info-circle mr-2" aria-hidden="true"></i>
                Información de Envío
            </h3>
            <ul class="text-sm text-blue-800 space-y-1">
                <li>• Tiempo de entrega: 2-5 días hábiles</li>
                <li class="text-orange-600 font-medium">• ¡Agrega $${remainingForFree.toFixed(2)} más y obtén envío GRATIS!</li>
                <li>• Productos congelados en empaques especiales</li>
                <li>• Confirmación por WhatsApp</li>
            </ul>
        `;
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
    
    // Configurar modal según método de pago
    setupConfirmationModal(orderData);
    
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
                quantity: item.cantidad,
                price: producto.precio
            };
        })
    });
    
    hideLoadingState();
    
    // Enviar datos por WhatsApp (opcional)
    prepareWhatsAppMessage(orderData);
}

// Configurar modal de confirmación según método de pago
function setupConfirmationModal(orderData) {
    const confirmationMessage = document.getElementById('confirmation-message');
    const transferInstructions = document.getElementById('transfer-instructions');
    const contactWhatsAppBtn = document.getElementById('contact-whatsapp');
    
    if (orderData.paymentMethod === 'transfer') {
        // Mostrar instrucciones específicas para transferencia
        if (confirmationMessage) {
            confirmationMessage.innerHTML = `
                <p class="mb-2">Gracias por tu pedido. Para completar tu compra, sigue los pasos a continuación:</p>
            `;
        }
        
        if (transferInstructions) {
            transferInstructions.classList.remove('hidden');
        }
        
        if (contactWhatsAppBtn) {
            contactWhatsAppBtn.classList.remove('hidden');
        }
    } else {
        // Mensaje estándar para otros métodos
        if (confirmationMessage) {
            confirmationMessage.innerHTML = `
                <p>Gracias por tu compra. Te contactaremos por WhatsApp para confirmar los detalles de tu pedido.</p>
            `;
        }
        
        if (transferInstructions) {
            transferInstructions.classList.add('hidden');
        }
        
        if (contactWhatsAppBtn) {
            contactWhatsAppBtn.classList.add('hidden');
        }
    }
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
        message += `• ${producto.nombre} x${item.cantidad} - $${(producto.precio * item.cantidad).toFixed(2)}\n`;
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

// ==================== PAYPAL INTEGRATION ====================

// Función para cargar el SDK de PayPal dinámicamente
function loadPayPalSDK() {
    return new Promise((resolve, reject) => {
        // Verificar si PayPal ya está cargado
        if (typeof paypal !== 'undefined') {
            console.log('✅ PayPal SDK ya está cargado');
            resolve();
            return;
        }

        // Verificar configuración (con timeout para asegurar que paypal-config.js esté cargado)
        setTimeout(() => {
            if (typeof PAYPAL_CONFIG === 'undefined' || !PAYPAL_CONFIG.clientId || PAYPAL_CONFIG.clientId === 'TU_CLIENT_ID_AQUI') {
                console.warn('⚠️ PayPal no configurado. Revisa paypal-config.js');
                reject(new Error('PayPal no configurado'));
                return;
            }

            // Verificar que las funciones auxiliares estén disponibles
            if (typeof getPayPalSDKUrl !== 'function') {
                console.error('❌ Función getPayPalSDKUrl no disponible');
                reject(new Error('Funciones de PayPal no disponibles'));
                return;
            }

            console.log('🔄 Cargando PayPal SDK...');
            
            // Crear y cargar el script de PayPal
            const script = document.createElement('script');
            script.src = getPayPalSDKUrl();
            script.async = true;
            
            script.onload = function() {
                console.log('✅ PayPal SDK cargado correctamente');
                resolve();
            };
            
            script.onerror = function() {
                console.error('❌ Error cargando PayPal SDK');
                reject(new Error('Error cargando PayPal SDK'));
            };
            
            document.head.appendChild(script);
        }, 100); // Pequeño timeout para asegurar que paypal-config.js esté cargado
    });
}

// Verificar configuración de PayPal con mejor manejo de errores
function checkPayPalConfig() {
    try {
        if (typeof validatePayPalConfig === 'function') {
            if (!validatePayPalConfig()) {
                console.error('❌ Configuración de PayPal incompleta. Revisa paypal-config.js');
                return false;
            }
        } else {
            console.warn('⚠️ Función validatePayPalConfig no disponible');
            // Verificación básica sin la función
            if (typeof PAYPAL_CONFIG === 'undefined' || !PAYPAL_CONFIG.clientId) {
                console.error('❌ PAYPAL_CONFIG no configurado correctamente');
                return false;
            }
        }
        return true;
    } catch (error) {
        console.error('❌ Error verificando configuración de PayPal:', error);
        return false;
    }
}

// Initialize PayPal Smart Payment Buttons
function initializePayPal() {
    // Verificar que PayPal esté disponible
    if (typeof paypal === 'undefined') {
        console.error('PayPal SDK no está cargado');
        showPayPalError('Error al cargar PayPal. Por favor recarga la página.');
        return;
    }

    // Verificar configuración con mejor manejo de errores
    if (!checkPayPalConfig()) {
        showPayPalError('Configuración de PayPal incompleta. Contacta al administrador.');
        return;
    }

    // Mostrar loading mientras se inicializa
    const container = document.getElementById('paypal-button-container');
    if (!container) {
        console.error('Contenedor de PayPal no encontrado');
        return;
    }

    container.innerHTML = '<div class="paypal-loading text-center py-4 text-gray-500">🔄 Cargando PayPal...</div>';

    try {
        paypal.Buttons({
            style: {
                layout: 'vertical',
                color: 'gold',
                shape: 'rect',
                label: 'paypal',
                height: 45
            },
            
            // Crear la orden
            createOrder: function(data, actions) {
                try {
                    const orderData = createPayPalOrder();
                    
                    if (!orderData || !orderData.total || parseFloat(orderData.total) <= 0) {
                        showPayPalError('Error al crear la orden: total inválido');
                        return Promise.reject(new Error('Invalid order total'));
                    }

                    console.log('🔄 Creando orden PayPal:', orderData);

                    const orderStructure = {
                        intent: 'CAPTURE',
                        purchase_units: [{
                            amount: {
                                currency_code: PAYPAL_CONFIG.currency,
                                value: orderData.total,
                                breakdown: {
                                    item_total: {
                                        currency_code: PAYPAL_CONFIG.currency,
                                        value: orderData.subtotal
                                    }
                                }
                            },
                            description: 'Productos tradicionales de La Tierrita',
                            items: orderData.items
                        }]
                    };

                    // Agregar envío si existe
                    if (parseFloat(orderData.shipping) > 0) {
                        orderStructure.purchase_units[0].amount.breakdown.shipping = {
                            currency_code: PAYPAL_CONFIG.currency,
                            value: orderData.shipping
                        };
                    }

                    // Agregar descuento si existe
                    if (parseFloat(orderData.discount) > 0) {
                        orderStructure.purchase_units[0].amount.breakdown.discount = {
                            currency_code: PAYPAL_CONFIG.currency,
                            value: orderData.discount
                        };
                    }

                    console.log('📦 Estructura de orden final:', orderStructure);

                    return actions.order.create(orderStructure);
                } catch (error) {
                    console.error('Error en createOrder:', error);
                    showPayPalError('Error al procesar la orden');
                    return Promise.reject(error);
                }
            },

            // Aprobar el pago
            onApprove: function(data, actions) {
                showPayPalLoading();
                
                return actions.order.capture().then(function(details) {
                    console.log('PayPal payment completed:', details);
                    
                    // Verificar el estado del pago
                    if (details.status === 'COMPLETED') {
                        handlePayPalSuccess(details);
                    } else {
                        throw new Error('Payment not completed');
                    }
                }).catch(function(error) {
                    console.error('Error capturing PayPal payment:', error);
                    handlePayPalError(error);
                });
            },

            // Manejar cancelación
            onCancel: function(data) {
                console.log('PayPal payment cancelled:', data);
                showPayPalError('Pago cancelado. Puedes intentar nuevamente.');
            },

            // Manejar errores
            onError: function(err) {
                console.error('PayPal error:', err);
                handlePayPalError(err);
            }

        }).render('#paypal-button-container').then(function() {
            console.log('✅ Botones de PayPal renderizados correctamente');
        }).catch(function(error) {
            console.error('❌ Error al renderizar botones de PayPal:', error);
            showPayPalError('Error al cargar los botones de PayPal');
        });
        
    } catch (error) {
        console.error('❌ Error al inicializar PayPal:', error);
        showPayPalError('Error al inicializar PayPal');
    }
}

// Crear datos de orden para PayPal
function createPayPalOrder() {
    try {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        if (cart.length === 0) {
            throw new Error('Carrito vacío');
        }

        let subtotal = 0;
        const items = [];
        
        // Calcular correctamente el subtotal usando los productos base
        cart.forEach(item => {
            const producto = productos.find(p => p.id === item.id);
            if (producto) {
                const itemTotal = producto.precio * item.cantidad;
                subtotal += itemTotal;
                
                items.push({
                    name: producto.nombre,
                    unit_amount: {
                        currency_code: PAYPAL_CONFIG.currency,
                        value: producto.precio.toFixed(2)
                    },
                    quantity: item.cantidad.toString(),
                    description: `${producto.peso || '500g'} - Producto tradicional ecuatoriano`,
                    category: 'PHYSICAL_GOODS'
                });
            }
        });

        // Calcular envío por provincia
        const provinceSelect = document.getElementById('province');
        const selectedProvince = provinceSelect ? provinceSelect.value : '';
        const shipping = calculateShippingByProvince(selectedProvince, subtotal);
        
        // Calcular descuento si hay cupón aplicado
        const discountRow = document.getElementById('discount-row');
        let discount = 0;
        if (discountRow && !discountRow.classList.contains('hidden')) {
            const discountText = document.getElementById('discount').textContent;
            discount = Math.abs(parseFloat(discountText.replace('-$', ''))) || 0;
        }

        const total = subtotal + shipping - discount;

        console.log('🧮 Orden PayPal calculada:', {
            subtotal: subtotal.toFixed(2),
            shipping: shipping.toFixed(2),
            discount: discount.toFixed(2),
            total: total.toFixed(2),
            items: items.length
        });

        return {
            items: items,
            subtotal: subtotal.toFixed(2),
            shipping: shipping.toFixed(2),
            discount: discount.toFixed(2),
            total: total.toFixed(2)
        };

    } catch (error) {
        console.error('Error creating PayPal order:', error);
        return null;
    }
}

// Manejar éxito del pago de PayPal
function handlePayPalSuccess(details) {
    console.log('Processing PayPal success:', details);
    
    try {
        // Extraer información del pago
        const transactionId = details.id;
        const payerInfo = details.payer;
        const amount = details.purchase_units[0].amount.value;
        
        // Generar número de orden único
        const orderNumber = 'LT' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
        
        // Crear objeto de orden completa
        const orderData = {
            orderNumber: orderNumber,
            transactionId: transactionId,
            paymentMethod: 'PayPal',
            amount: amount,
            currency: PAYPAL_CONFIG.currency,
            status: 'completed',
            customer: {
                email: payerInfo.email_address || '',
                name: payerInfo.name ? `${payerInfo.name.given_name} ${payerInfo.name.surname}` : '',
                paypalId: payerInfo.payer_id
            },
            items: JSON.parse(localStorage.getItem('cart')) || [],
            timestamp: new Date().toISOString(),
            formData: collectFormData()
        };

        // Guardar la orden
        saveCompletedOrder(orderData);

        // Limpiar carrito
        localStorage.removeItem('cart');
        
        // Actualizar carrito en la página principal si está abierta
        if (window.opener) {
            try {
                window.opener.postMessage({type: 'cart-cleared'}, '*');
            } catch (e) {
                console.log('No se pudo comunicar con la ventana principal');
            }
        }

        // Google Analytics - Purchase Event
        gtag('event', 'purchase', {
            transaction_id: transactionId,
            value: parseFloat(amount),
            currency: PAYPAL_CONFIG.currency,
            items: orderData.items.map(item => ({
                item_id: item.id.toString(),
                item_name: item.nombre,
                category: 'Bocaditos Tradicionales',
                quantity: item.cantidad,
                price: item.precio
            }))
        });

        // Mostrar modal de confirmación
        showOrderConfirmation(orderData);
        
        // Mostrar mensaje de éxito
        showPayPalSuccess('¡Pago procesado exitosamente!');

    } catch (error) {
        console.error('Error processing PayPal success:', error);
        handlePayPalError(error);
    }
}

// Manejar error del pago de PayPal
function handlePayPalError(error) {
    console.error('PayPal Error:', error);
    
    let message = 'Hubo un problema procesando tu pago.';
    let technicalInfo = '';
    
    if (error.message) {
        technicalInfo = error.message;
        
        if (error.message.includes('INSTRUMENT_DECLINED')) {
            message = 'Tu método de pago fue rechazado. Por favor intenta con otro.';
        } else if (error.message.includes('INSUFFICIENT_FUNDS')) {
            message = 'Fondos insuficientes. Por favor verifica tu cuenta.';
        } else if (error.message.includes('INVALID_ACCOUNT')) {
            message = 'Problema con la cuenta de PayPal. Por favor intenta nuevamente.';
        } else if (error.message.includes('PAYPAL_REQUEST_ID_REQUIRED')) {
            message = 'Error de configuración. Por favor contacta al administrador.';
        } else if (error.message.includes('VALIDATION_ERROR')) {
            message = 'Error en los datos de la orden. Por favor intenta nuevamente.';
        } else if (error.message.includes('ORDER_NOT_APPROVED')) {
            message = 'La orden no fue aprobada. Por favor intenta nuevamente.';
        }
    }
    
    // Mostrar información técnica en consola para depuración
    if (technicalInfo) {
        console.error('Información técnica del error:', technicalInfo);
    }
    
    showPayPalError(message + ' Puedes intentar nuevamente o usar otro método de pago.');
    
    // Google Analytics - Error Event
    if (typeof gtag === 'function') {
        gtag('event', 'payment_error', {
            event_category: 'ecommerce',
            event_label: 'paypal_error',
            value: technicalInfo || error.message || 'unknown_error'
        });
    }
}

// Manejar cancelación del pago de PayPal
function handlePayPalCancel() {
    console.log('PayPal payment was cancelled by user');
    
    showNotification('Pago cancelado. Puedes intentar nuevamente cuando gustes.', 'info');
    
    // Google Analytics - Cancel Event
    gtag('event', 'payment_cancel', {
        event_category: 'ecommerce',
        event_label: 'paypal_cancel'
    });
}

// Función de depuración para PayPal
function debugPayPalSetup() {
    console.log('🔍 Depurando configuración de PayPal...');
    
    // Verificar que las variables globales estén disponibles
    console.log('PAYPAL_CONFIG disponible:', typeof PAYPAL_CONFIG !== 'undefined');
    if (typeof PAYPAL_CONFIG !== 'undefined') {
        console.log('Client ID configurado:', PAYPAL_CONFIG.clientId ? 'Sí' : 'No');
        console.log('Moneda:', PAYPAL_CONFIG.currency);
        console.log('Entorno:', PAYPAL_CONFIG.environment);
    }
    
    // Verificar funciones auxiliares
    console.log('validatePayPalConfig disponible:', typeof validatePayPalConfig === 'function');
    console.log('getPayPalSDKUrl disponible:', typeof getPayPalSDKUrl === 'function');
    
    // Verificar SDK de PayPal
    console.log('PayPal SDK cargado:', typeof paypal !== 'undefined');
    
    // Verificar elemento contenedor
    const container = document.getElementById('paypal-button-container');
    console.log('Contenedor PayPal encontrado:', !!container);
    
    // Verificar datos del carrito
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    console.log('Productos en carrito:', cart.length);
}

// Función para mostrar errores de PayPal de manera más amigable
function showPayPalError(message) {
    console.error('PayPal Error:', message);
    
    const container = document.getElementById('paypal-button-container');
    if (container) {
        container.innerHTML = `
            <div class="paypal-error bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <div class="text-red-600 mb-2">
                    <i class="fas fa-exclamation-triangle text-xl"></i>
                </div>
                <div class="text-red-800 font-medium mb-2">PayPal no disponible</div>
                <div class="text-red-600 text-sm mb-3">${message}</div>
                <div class="text-xs text-red-500">
                    Puedes usar transferencia bancaria o pago contraentrega como alternativa.
                </div>
                <button onclick="debugPayPalSetup()" class="mt-2 text-xs text-blue-600 hover:text-blue-800 underline">
                    Mostrar información técnica (para desarrolladores)
                </button>
            </div>`;
    }
}

// Función para mostrar loading de PayPal
function showPayPalLoading() {
    const container = document.getElementById('paypal-button-container');
    if (container) {
        container.innerHTML = `
            <div class="paypal-loading text-center py-4 text-gray-500">
                <div class="animate-spin inline-block w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full mb-2"></div>
                <div>Procesando pago...</div>
            </div>`;
    }
}

// Event listener para cambio de provincia
    const provinceSelect = document.getElementById('province');
    if (provinceSelect) {
        provinceSelect.addEventListener('change', function() {
            // Recalcular totales cuando cambie la provincia
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            let subtotal = 0;
            cart.forEach(item => {
                const producto = productos.find(p => p.id === item.id);
                if (producto) {
                    subtotal += producto.precio * item.cantidad;
                }
            });
            updateOrderSummary(subtotal);
        });
    }

// Validar que se haya seleccionado una provincia antes de calcular envío
function validateProvinceSelection() {
    const provinceSelect = document.getElementById('province');
    const shippingElement = document.getElementById('shipping');
    
    if (!provinceSelect || !provinceSelect.value) {
        if (shippingElement) {
            shippingElement.innerHTML = '<span class="text-amber-600">Selecciona provincia</span>';
        }
        return false;
    }
    return true;
}

// Configurar listeners para métodos de pago
function setupPaymentMethodListeners() {
    const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
    const transferInfo = document.getElementById('transfer-info');
    const placeOrderText = document.getElementById('place-order-text');
    const placeOrderIcon = document.querySelector('#place-order-btn i');
    
    paymentMethods.forEach(method => {
        method.addEventListener('change', function() {
            updatePaymentUI(this.value);
        });
    });
    
    // Inicializar con el método seleccionado por defecto
    const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked');
    if (selectedMethod) {
        updatePaymentUI(selectedMethod.value);
    }
}

// Actualizar UI según método de pago seleccionado
function updatePaymentUI(paymentMethod) {
    const transferInfo = document.getElementById('transfer-info');
    const placeOrderText = document.getElementById('place-order-text');
    const placeOrderIcon = document.querySelector('#place-order-btn i');
    
    // Mostrar/ocultar información de transferencia
    if (transferInfo) {
        if (paymentMethod === 'transfer') {
            transferInfo.style.display = 'block';
        } else {
            transferInfo.style.display = 'none';
        }
    }
    
    // Actualizar texto del botón
    if (placeOrderText && placeOrderIcon) {
        switch (paymentMethod) {
            case 'transfer':
                placeOrderText.textContent = 'Solicitar Datos Bancarios';
                placeOrderIcon.className = 'fas fa-university mr-2';
                break;
            case 'paypal':
                placeOrderText.textContent = 'Proceder con PayPal';
                placeOrderIcon.className = 'fab fa-paypal mr-2';
                break;
            case 'cash':
                placeOrderText.textContent = 'Confirmar Pedido (Pago Contraentrega)';
                placeOrderIcon.className = 'fas fa-money-bill-wave mr-2';
                break;
            default:
                placeOrderText.textContent = 'Finalizar Pedido';
                placeOrderIcon.className = 'fas fa-credit-card mr-2';
        }
    }
}

// Abrir WhatsApp con mensaje preparado
function openWhatsApp() {
    const whatsappUrl = localStorage.getItem('lastWhatsAppMessage');
    if (whatsappUrl) {
        window.open(whatsappUrl, '_blank');
    } else {
        // Fallback a WhatsApp directo
        window.open('https://wa.me/593987654321', '_blank');
    }
}

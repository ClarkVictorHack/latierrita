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
    
    // Cargar PayPal SDK dinámicamente y luego inicializar
    loadPayPalSDK().then(() => {
        initializePayPal();
    }).catch(error => {
        console.error('Error cargando PayPal:', error);
        showPayPalError('Error al cargar PayPal. Por favor recarga la página.');
    });
    
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
                quantity: item.cantidad,
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

        // Verificar configuración
        if (typeof PAYPAL_CONFIG === 'undefined' || PAYPAL_CONFIG.clientId === 'TU_CLIENT_ID_AQUI') {
            console.warn('⚠️ PayPal no configurado. Revisa paypal-config.js');
            reject(new Error('PayPal no configurado'));
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
    });
}

// Verificar configuración de PayPal
if (!validatePayPalConfig()) {
    console.error('❌ Configuración de PayPal incompleta. Revisa paypal-config.js');
}

// Initialize PayPal Smart Payment Buttons
function initializePayPal() {
    // Verificar que PayPal esté disponible
    if (typeof paypal === 'undefined') {
        console.error('PayPal SDK no está cargado');
        showPayPalError('Error al cargar PayPal. Por favor recarga la página.');
        return;
    }

    // Verificar configuración
    if (!validatePayPalConfig()) {
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

        // Calcular envío
        const shipping = subtotal >= 50 ? 0 : 5.00;
        
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
    
    if (error.message) {
        if (error.message.includes('INSTRUMENT_DECLINED')) {
            message = 'Tu método de pago fue rechazado. Por favor intenta con otro.';
        } else if (error.message.includes('INSUFFICIENT_FUNDS')) {
            message = 'Fondos insuficientes. Por favor verifica tu cuenta.';
        } else if (error.message.includes('INVALID_ACCOUNT')) {
            message = 'Problema con la cuenta de PayPal. Por favor intenta nuevamente.';
        }
    }
    
    showPayPalError(message + ' Puedes intentar nuevamente o usar otro método de pago.');
    
    // Google Analytics - Error Event
    gtag('event', 'payment_error', {
        event_category: 'ecommerce',
        event_label: 'paypal_error',
        value: error.message || 'unknown_error'
    });
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

// Utilidades para mostrar estados de PayPal
function showPayPalLoading() {
    const container = document.getElementById('paypal-button-container');
    if (container) {
        container.innerHTML = '<div class="paypal-loading">Procesando pago...</div>';
    }
}

function showPayPalSuccess(message) {
    const container = document.getElementById('paypal-button-container');
    if (container) {
        container.innerHTML = `<div class="payment-success"><i class="fas fa-check-circle mr-2"></i>${message}</div>`;
    }
}

function showPayPalError(message) {
    const container = document.getElementById('paypal-button-container');
    if (container) {
        container.innerHTML = `
            <div class="payment-error">
                <i class="fas fa-exclamation-triangle mr-2"></i>${message}
                <button onclick="initializePayPal()" class="ml-4 text-sm underline hover:no-underline">
                    Reintentar
                </button>
            </div>
        `;
    }
}

// Recopilar datos del formulario
function collectFormData() {
    const form = document.getElementById('checkout-form');
    if (!form) return {};
    
    const formData = new FormData(form);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    return data;
}

// Guardar orden completada
function saveCompletedOrder(orderData) {
    try {
        // Guardar en localStorage para historial local
        const orders = JSON.parse(localStorage.getItem('completedOrders')) || [];
        orders.unshift(orderData); // Agregar al inicio
        
        // Mantener solo las últimas 10 órdenes
        if (orders.length > 10) {
            orders.splice(10);
        }
        
        localStorage.setItem('completedOrders', JSON.stringify(orders));
        
        // Aquí podrías enviar la orden a tu backend
        // sendOrderToBackend(orderData);
        
        console.log('Orden guardada exitosamente:', orderData.orderNumber);
        
    } catch (error) {
        console.error('Error saving completed order:', error);
    }
}

// Mostrar modal de confirmación de orden
function showOrderConfirmation(orderData) {
    try {
        // Actualizar el número de orden en el modal
        const orderNumberElement = document.getElementById('order-number');
        if (orderNumberElement) {
            orderNumberElement.textContent = orderData.orderNumber;
        }
        
        // Mostrar el modal
        const modal = document.getElementById('order-confirmation-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
        
        // Auto-cerrar después de 10 segundos
        setTimeout(() => {
            if (modal && !modal.classList.contains('hidden')) {
                closeConfirmation();
            }
        }, 10000);
        
    } catch (error) {
        console.error('Error showing order confirmation:', error);
    }
}

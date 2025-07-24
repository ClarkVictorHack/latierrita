// Carrito de compras y funcionalidad de productos
let carrito = [];
let paypalInitialized = false;

// Datos de configuración
const CONFIG = {
    currency: 'USD',
    paypalClientId: 'sb', // Cambiar por el client ID real en producción
    apiUrl: '/api' // URL base del backend
};

// Inicializar cuando carga la página
document.addEventListener('DOMContentLoaded', function() {
    actualizarContadorCarrito();
    cargarCarritoGuardado();
});

// Función para cambiar cantidad en el selector
function cambiarCantidad(productId, change) {
    const input = document.getElementById(`cantidad-${productId}`);
    let currentValue = parseInt(input.value);
    let newValue = currentValue + change;
    
    if (newValue >= 1) {
        input.value = newValue;
    }
}

// Función para agregar producto al carrito
function agregarAlCarrito(id, nombre, precio, categoria) {
    const cantidadElement = document.getElementById(`cantidad-${id}`);
    const cantidad = parseInt(cantidadElement.value);
    
    // Buscar si el producto ya existe en el carrito
    const productoExistente = carrito.find(item => item.id === id);
    
    if (productoExistente) {
        productoExistente.cantidad += cantidad;
    } else {
        carrito.push({
            id: id,
            nombre: nombre,
            precio: precio,
            cantidad: cantidad,
            categoria: categoria
        });
    }
    
    // Resetear cantidad a 1
    cantidadElement.value = 1;
    
    // Actualizar UI
    actualizarContadorCarrito();
    guardarCarrito();
    mostrarMensajeTemporal(`${nombre} agregado al carrito`);
}

// Función para actualizar contador del carrito
function actualizarContadorCarrito() {
    const contador = document.getElementById('carritoContador');
    const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
    contador.textContent = totalItems;
    contador.style.display = totalItems > 0 ? 'flex' : 'none';
}

// Función para mostrar/ocultar el modal del carrito
function toggleCarrito() {
    const modal = document.getElementById('carritoModal');
    const isVisible = modal.style.display === 'block';
    
    if (isVisible) {
        modal.style.display = 'none';
    } else {
        modal.style.display = 'block';
        actualizarCarritoModal();
        initPayPalButtons();
    }
}

// Función para actualizar el contenido del modal del carrito
function actualizarCarritoModal() {
    const carritoItems = document.getElementById('carritoItems');
    const carritoTotal = document.getElementById('carritoTotal');
    
    if (carrito.length === 0) {
        carritoItems.innerHTML = '<p style="text-align: center; color: #999; padding: 2rem;">Tu carrito está vacío</p>';
        carritoTotal.textContent = 'Total: $0.00';
        return;
    }
    
    let html = '';
    let total = 0;
    
    carrito.forEach((item, index) => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;
        
        html += `
            <div class="carrito-item">
                <img src="https://placehold.co/60x60/dfbf85/333333?text=${encodeURIComponent(item.nombre.substring(0,10))}" 
                     alt="${item.nombre}" class="carrito-item-imagen">
                <div class="carrito-item-info">
                    <div class="carrito-item-nombre">${item.nombre}</div>
                    <div class="carrito-item-precio">$${item.precio.toFixed(2)} x ${item.cantidad} = $${subtotal.toFixed(2)}</div>
                </div>
                <div class="cantidad-selector">
                    <button class="cantidad-btn" onclick="actualizarCantidadCarrito(${index}, -1)">-</button>
                    <input type="number" class="cantidad-input" value="${item.cantidad}" min="1" readonly>
                    <button class="cantidad-btn" onclick="actualizarCantidadCarrito(${index}, 1)">+</button>
                </div>
                <button onclick="eliminarDelCarrito(${index})" style="background: #dc3545; color: white; border: none; padding: 0.5rem; border-radius: 0.25rem; cursor: pointer;">
                    🗑️
                </button>
            </div>
        `;
    });
    
    carritoItems.innerHTML = html;
    carritoTotal.textContent = `Total: $${total.toFixed(2)}`;
}

// Función para actualizar cantidad en el carrito
function actualizarCantidadCarrito(index, change) {
    if (carrito[index]) {
        carrito[index].cantidad += change;
        
        if (carrito[index].cantidad <= 0) {
            carrito.splice(index, 1);
        }
        
        actualizarContadorCarrito();
        actualizarCarritoModal();
        guardarCarrito();
        initPayPalButtons(); // Reinicializar PayPal con nuevo total
    }
}

// Función para eliminar producto del carrito
function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    actualizarContadorCarrito();
    actualizarCarritoModal();
    guardarCarrito();
    initPayPalButtons(); // Reinicializar PayPal con nuevo total
}

// Función para filtrar productos
function filtrarProductos(categoria) {
    // Actualizar botones de filtro
    document.querySelectorAll('.filtro-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Mostrar/ocultar productos
    const productos = document.querySelectorAll('.producto-card');
    
    productos.forEach(producto => {
        const productoCategoria = producto.getAttribute('data-categoria');
        
        if (categoria === 'todos' || productoCategoria === categoria) {
            producto.style.display = 'block';
        } else {
            producto.style.display = 'none';
        }
    });
    
    // Mostrar/ocultar secciones de categoría
    const secciones = document.querySelectorAll('.categoria-section');
    secciones.forEach(seccion => {
        const seccionId = seccion.id;
        
        if (categoria === 'todos') {
            seccion.style.display = 'block';
        } else if (categoria === seccionId) {
            seccion.style.display = 'block';
        } else {
            seccion.style.display = 'none';
        }
    });
}

// Función para guardar carrito en localStorage
function guardarCarrito() {
    localStorage.setItem('carritoLaTierrita', JSON.stringify(carrito));
}

// Función para cargar carrito guardado
function cargarCarritoGuardado() {
    const carritoGuardado = localStorage.getItem('carritoLaTierrita');
    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
        actualizarContadorCarrito();
    }
}

// Función para mostrar mensaje temporal
function mostrarMensajeTemporal(mensaje) {
    // Crear elemento de mensaje
    const mensajeElement = document.createElement('div');
    mensajeElement.textContent = mensaje;
    mensajeElement.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: var(--verde-oliva);
        color: white;
        padding: 1rem;
        border-radius: 0.5rem;
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(mensajeElement);
    
    // Eliminar después de 3 segundos
    setTimeout(() => {
        mensajeElement.remove();
    }, 3000);
}

// Funciones de PayPal
function calcularTotal() {
    return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
}

// Inicializar botones de PayPal
function initPayPalButtons() {
    const container = document.getElementById('paypal-button-container');
    
    if (!container || carrito.length === 0) {
        if (container) container.innerHTML = '';
        return;
    }
    
    // Limpiar contenedor
    container.innerHTML = '';
    
    if (paypalInitialized) {
        return;
    }
    
    const total = calcularTotal();
    
    if (total <= 0) {
        return;
    }
    
    try {
        paypal.Buttons({
            // Crear orden
            createOrder: function(data, actions) {
                return createPayPalOrder();
            },
            
            // Manejar aprobación
            onApprove: function(data, actions) {
                return capturePayPalOrder(data.orderID);
            },
            
            // Manejar errores
            onError: function(err) {
                console.error('Error de PayPal:', err);
                mostrarMensaje('Ocurrió un error al procesar el pago. Por favor, inténtalo de nuevo.', 'error');
            },
            
            // Manejar cancelación
            onCancel: function(data) {
                mostrarMensaje('Pago cancelado por el usuario.', 'error');
            }
        }).render('#paypal-button-container');
        
        paypalInitialized = true;
    } catch (error) {
        console.error('Error al inicializar PayPal:', error);
        mostrarMensaje('Error al cargar PayPal. Por favor, recarga la página.', 'error');
    }
}

// Crear orden en PayPal
async function createPayPalOrder() {
    try {
        mostrarLoader(true);
        
        const orderData = {
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: CONFIG.currency,
                    value: calcularTotal().toFixed(2)
                },
                description: 'Productos La Tierrita',
                items: carrito.map(item => ({
                    name: item.nombre,
                    quantity: item.cantidad.toString(),
                    unit_amount: {
                        currency_code: CONFIG.currency,
                        value: item.precio.toFixed(2)
                    }
                }))
            }]
        };
        
        const response = await fetch(`${CONFIG.apiUrl}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const order = await response.json();
        mostrarLoader(false);
        
        return order.id;
    } catch (error) {
        console.error('Error al crear orden:', error);
        mostrarLoader(false);
        mostrarMensaje('Error al crear la orden. Por favor, inténtalo de nuevo.', 'error');
        throw error;
    }
}

// Capturar orden de PayPal
async function capturePayPalOrder(orderID) {
    try {
        mostrarLoader(true);
        
        const response = await fetch(`${CONFIG.apiUrl}/orders/${orderID}/capture`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const orderData = await response.json();
        mostrarLoader(false);
        
        // Verificar que el pago fue exitoso
        if (orderData.status === 'COMPLETED') {
            mostrarMensaje('¡Pago completado exitosamente! Gracias por tu compra.', 'exito');
            limpiarCarrito();
            setTimeout(() => {
                toggleCarrito();
            }, 3000);
        } else {
            mostrarMensaje('El pago no se completó correctamente. Por favor, contacta con soporte.', 'error');
        }
        
        return orderData;
    } catch (error) {
        console.error('Error al capturar orden:', error);
        mostrarLoader(false);
        mostrarMensaje('Error al procesar el pago. Por favor, inténtalo de nuevo.', 'error');
        throw error;
    }
}

// Funciones auxiliares
function mostrarLoader(show) {
    const loader = document.getElementById('loader');
    loader.style.display = show ? 'block' : 'none';
}

function mostrarMensaje(mensaje, tipo) {
    const container = document.getElementById('mensaje-estado');
    container.className = `mensaje-estado mensaje-${tipo}`;
    container.textContent = mensaje;
    container.style.display = 'block';
    
    // Ocultar después de 5 segundos
    setTimeout(() => {
        container.style.display = 'none';
    }, 5000);
}

function limpiarCarrito() {
    carrito = [];
    actualizarContadorCarrito();
    actualizarCarritoModal();
    guardarCarrito();
    paypalInitialized = false;
}

// Cerrar modal al hacer clic fuera
document.addEventListener('click', function(event) {
    const modal = document.getElementById('carritoModal');
    if (event.target === modal) {
        toggleCarrito();
    }
});

// Prevenir que el modal se cierre al hacer clic dentro del contenido
document.querySelector('.carrito-contenido').addEventListener('click', function(event) {
    event.stopPropagation();
});

// Agregar animación CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

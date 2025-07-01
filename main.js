// Este archivo contiene toda la lógica JS de la landing page de La Tierrita.
// Incluye: animación de introducción, menú móvil, productos, carrito, formulario distribuidores, geolocalización y mapa mejorados.

// --- ANIMACIÓN DE INTRODUCCIÓN ---

// Asegurar que las funciones estén disponibles globalmente desde el inicio
let carrito = JSON.parse(localStorage.getItem('cart')) || [];

// Función para migrar datos del carrito anterior
function migrarCarritoAnterior() {
    const carritoAnterior = localStorage.getItem('carritoLaTierrita');
    if (carritoAnterior && carrito.length === 0) {
        try {
            carrito = JSON.parse(carritoAnterior);
            localStorage.setItem('cart', carritoAnterior);
            localStorage.removeItem('carritoLaTierrita');
            console.log('Carrito migrado exitosamente');
        } catch (error) {
            console.error('Error migrando carrito anterior:', error);
        }
    }
}

function agregarAlCarrito(productoId) {
    console.log('� agregarAlCarrito llamado con ID:', productoId);
    console.log('🔍 Estado actual:');
    console.log('  - productos disponibles:', productos ? productos.length : 'undefined');
    console.log('  - carrito actual:', carrito ? carrito.length : 'undefined');
    console.log('  - localStorage:', localStorage.getItem('cart'));
    
    if (!productos || productos.length === 0) {
        console.error('❌ No hay productos definidos');
        alert('Error: No hay productos disponibles');
        return;
    }
    
    const producto = productos.find(p => p.id === productoId);
    if (!producto) {
        console.error('❌ Producto no encontrado:', productoId);
        console.log('Productos disponibles:', productos.map(p => ({id: p.id, nombre: p.nombre})));
        alert(`Error: Producto con ID ${productoId} no encontrado`);
        return;
    }
    
    console.log('✅ Producto encontrado:', producto);
    
    // Asegurar que carrito existe
    if (!carrito) {
        console.warn('⚠️ Carrito no inicializado, creando nuevo');
        carrito = [];
    }
    
    const itemExistente = carrito.find(item => item.id === productoId);
    if (itemExistente) {
        itemExistente.cantidad += 1;
        console.log('📈 Cantidad actualizada:', itemExistente);
    } else {
        const nuevoItem = {
            id: producto.id,
            nombre: producto.nombre,
            precio: parseFloat(producto.precio), // Asegurar que sea número
            imagen: producto.imagen,
            cantidad: 1
        };
        carrito.push(nuevoItem);
        console.log('➕ Nuevo item agregado:', nuevoItem);
    }
    
    try {
        guardarCarrito();
        actualizarCarrito();
        mostrarNotificacionCarrito(producto.nombre);
        console.log('🛒 Carrito actualizado exitosamente. Total items:', carrito.length);
    } catch (error) {
        console.error('❌ Error al actualizar carrito:', error);
        alert('Error al actualizar el carrito: ' + error.message);
    }
}

// Hacer funciones disponibles globalmente desde el inicio
window.agregarAlCarrito = agregarAlCarrito;

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM cargado, inicializando La Tierrita...');
    
    // Migrar carrito anterior
    migrarCarritoAnterior();
    
    // Asegurar que las funciones estén disponibles globalmente
    window.agregarAlCarrito = agregarAlCarrito;
    window.removerDelCarrito = removerDelCarrito;
    window.cambiarCantidad = cambiarCantidad;
    
    // Inicializar funcionalidad básica
    inicializarMenuMovil();
    inicializarCarrito();
    
    const introBg = document.getElementById('intro-animation-bg');
    const introVideo = document.getElementById('intro-animation-video');
    if (introBg && introVideo) {
        let introHidden = false;
        introVideo.currentTime = 0;
        introVideo.playbackRate = 1.5; // velocidad rápida pero visible
        function hideIntro() {
            if (introHidden) return;
            introHidden = true;
            introBg.classList.add('hide');
            setTimeout(() => {
                introBg.style.display = 'none';
                introVideo.pause();
                introVideo.currentTime = 0;
            }, 500);
        }
        introVideo.addEventListener('ended', hideIntro);
        introBg.addEventListener('click', hideIntro);
        // Por si el video no carga bien, forzar ocultar tras 8s
        setTimeout(hideIntro, 8000);
    }
    
    console.log('🎉 La Tierrita inicializada correctamente');
    console.log('🔧 Funciones globales disponibles:', {
        agregarAlCarrito: typeof window.agregarAlCarrito,
        removerDelCarrito: typeof window.removerDelCarrito,
        cambiarCantidad: typeof window.cambiarCantidad
    });
});

// Nueva función de inicialización del carrito
function inicializarCarrito() {
    console.log('🛒 Inicializando carrito...');
    
    // Migrar carrito anterior si existe
    migrarCarritoAnterior();
    
    // Renderizar productos
    renderizarProductos();
    
    // Actualizar carrito
    actualizarCarrito();
    
    // Configurar botones del carrito
    configurarBotonesCarrito();
    
    // Escuchar mensajes de otras ventanas (checkout)
    window.addEventListener('message', function(event) {
        if (event.data && event.data.type === 'cart-cleared') {
            carrito = [];
            guardarCarrito();
            actualizarCarrito();
        }
    });
    
    // Verificar que las funciones estén disponibles
    setTimeout(() => {
        console.log('🔍 Verificando funciones después de inicialización:');
        console.log('  - agregarAlCarrito:', typeof window.agregarAlCarrito);
        console.log('  - productos definidos:', typeof productos !== 'undefined');
        console.log('  - carrito definido:', typeof carrito !== 'undefined');
        console.log('  - productos count:', productos ? productos.length : 0);
        console.log('  - carrito count:', carrito ? carrito.length : 0);
        
        // Verificar botones en el DOM
        const botones = document.querySelectorAll('[onclick*="agregarAlCarrito"], .btn-agregar-carrito');
        console.log('  - botones encontrados:', botones.length);
        
        botones.forEach((boton, index) => {
            console.log(`    Botón ${index + 1}:`, {
                onclick: boton.onclick,
                visible: boton.offsetParent !== null,
                style: boton.style.display
            });
        });
    }, 500);
    
    console.log('✅ Carrito inicializado. Productos:', productos ? productos.length : 0, 'Items:', carrito ? carrito.length : 0);
}

// Nueva función para configurar botones del carrito
function configurarBotonesCarrito() {
    console.log('🔧 Configurando botones del carrito...');
    
    // Configurar botón del carrito en header
    const cartButton = document.getElementById('cart-button');
    if (cartButton) {
        cartButton.addEventListener('click', function() {
            document.getElementById('cart-modal').classList.remove('hidden');
        });
    }
    
    // Configurar botón de cerrar carrito
    const closeCartButton = document.getElementById('close-cart-button');
    if (closeCartButton) {
        closeCartButton.addEventListener('click', function() {
            document.getElementById('cart-modal').classList.add('hidden');
        });
    }
    
    // Configurar botón de checkout
    const checkoutButton = document.getElementById('checkout-button');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', function() {
            if (carrito.length > 0) {
                window.location.href = 'checkout.html';
            } else {
                alert('Tu carrito está vacío');
            }
        });
    }
    
    console.log('✅ Botones del carrito configurados');
}

// --- CATÁLOGO DE PRODUCTOS (orden: tradicionales primero, luego gourmet) ---
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
        ingredientes: "Plátano, leche, sal, hierbita y queso.",
        pagina: "mini-bolon-de-verde.html"
    },
    {
        id: 4,
        nombre: "Mini Bolón de Maduro",
        categoria: "Bocaditos Tradicionales",
        imagen: "img/mini bolon de maduro.png",
        descripcion: "Hechos con plátano maduro cuidadosamente seleccionado mezclado con queso.",
        precio: 3.50,
        peso: "500g",
        ingredientes: "Maduro, grasa vegetal, sal y queso.",
        pagina: "mini-bolon-de-maduro.html"
    },
    {
        id: 1,
        nombre: "Mini Muchin de Yuca",
        categoria: "Bocaditos Tradicionales",
        imagen: "img/mini muchin.png",
        descripcion: "¡Mini muchines, máximo sabor! Crujientes, con queso, y hechos 100% con yuca natural.",
        precio: 3.50,
        peso: "500g",
        ingredientes: "Yuca, sal y queso.",
        pagina: "mini-muchin-de-yuca.html"
    },
    {
        id: 2,
        nombre: "Pan de Yuca",
        categoria: "Bocaditos Tradicionales",
        imagen: "img/pan de yuca.png",
        descripcion: "¡Ligereza y sabor en cada bocado! Panes suaves, crocantes y 100% sin gluten.",
        precio: 3.50,
        peso: "500g",
        ingredientes: "Almidón, queso, crema de leche, grasa vegetal, sal, agua.",
        pagina: "pan-de-yuca.html"
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
        ingredientes: "Maduro, sal, grasa vegetal y queso.",
        pagina: "maria-pipona-de-maduro.html"
    },
    {
        id: 5,
        nombre: "Maria Pipona de Verde",
        categoria: "Bocaditos Gourmet",
        imagen: "img/maria pipona de verde.jpg",
        descripcion: "Hechas con plátano verde y rellenas de puro sabor, son perfectas para resolver el desayuno.",
        precio: 3.00,
        peso: "400g",
        ingredientes: "Verde, sal, grasa vegetal y queso.",
        pagina: "maria-pipona-de-verde.html"
    },
    {
        id: 7,
        nombre: "Muchines de Yuca",
        categoria: "Bocaditos Gourmet",
        imagen: "img/muchines de yuca.jpg",
        descripcion: "Crujientes por fuera, suaves por dentro. Hechos con yuca 100% natural y el toque perfecto de sal.",
        precio: 3.00,
        peso: "400g",
        ingredientes: "Yuca, sal y grasa vegetal.",
        pagina: "muchines-de-yuca.html"
    },
    {
        id: 8,
        nombre: "Torrejas",
        categoria: "Bocaditos Gourmet",
        imagen: "img/torrejas.jpg",
        descripcion: "Esponjosas y doradas, perfectas para acompañar con café o chocolate caliente.",
        precio: 3.00,
        peso: "400g",
        ingredientes: "Harina, huevo, leche, azúcar, sal.",
        pagina: "torrejas.html"
    }
];

// --- GESTIÓN DEL CARRITO ---
// carrito ya está declarado al inicio del archivo

function removerDelCarrito(productoId) {
    carrito = carrito.filter(item => item.id !== productoId);
    guardarCarrito();
    actualizarCarrito();
}

function cambiarCantidad(productoId, nuevaCantidad) {
    if (nuevaCantidad <= 0) {
        removerDelCarrito(productoId);
        return;
    }
    
    const item = carrito.find(item => item.id === productoId);
    if (item) {
        item.cantidad = nuevaCantidad;
        guardarCarrito();
        actualizarCarrito();
    }
}

function guardarCarrito() {
    localStorage.setItem('cart', JSON.stringify(carrito));
}

function obtenerTotalCarrito() {
    const total = carrito.reduce((total, item) => {
        // Validar que el item tenga precio y cantidad válidos
        const precio = parseFloat(item.precio);
        const cantidad = parseInt(item.cantidad);
        
        if (isNaN(precio) || isNaN(cantidad)) {
            console.error('Item con datos inválidos:', item);
            return total;
        }
        
        const subtotal = precio * cantidad;
        console.log(`Item: ${item.nombre}, Precio: ${precio}, Cantidad: ${cantidad}, Subtotal: ${subtotal}`);
        return total + subtotal;
    }, 0);
    
    console.log('Total calculado del carrito:', total);
    return total;
}

function obtenerCantidadTotal() {
    return carrito.reduce((total, item) => total + item.cantidad, 0);
}

function vaciarCarrito() {
    carrito = [];
    guardarCarrito();
    actualizarCarrito();
}

function actualizarCarrito() {
    const contadorCarrito = document.getElementById('cart-count');
    const listaCarrito = document.getElementById('cart-items');
    const totalCarrito = document.getElementById('cart-total');
    const botonCheckout = document.getElementById('checkout-button');
    
    const cantidadTotal = obtenerCantidadTotal();
    const precioTotal = obtenerTotalCarrito();
    
    // Actualizar contador
    if (contadorCarrito) {
        contadorCarrito.textContent = cantidadTotal;
        contadorCarrito.style.display = cantidadTotal > 0 ? 'block' : 'none';
    }
    
    // Actualizar lista de items
    if (listaCarrito) {
        if (carrito.length === 0) {
            listaCarrito.innerHTML = '<p class="text-gray-500 text-center py-4">Tu carrito está vacío</p>';
        } else {
            listaCarrito.innerHTML = carrito.map(item => `
                <div class="flex items-center justify-between p-2 border-b border-gray-100">
                    <div class="flex items-center space-x-3">
                        <img src="${item.imagen}" alt="${item.nombre}" class="w-12 h-12 object-cover rounded">
                        <div>
                            <h4 class="font-medium text-sm">${item.nombre}</h4>
                            <p class="text-brand-naranja-mostaza font-bold text-sm">$${item.precio.toFixed(2)}</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-2">
                        <button onclick="cambiarCantidad(${item.id}, ${item.cantidad - 1})" 
                                class="w-6 h-6 bg-gray-200 rounded-full text-sm hover:bg-gray-300">-</button>
                        <span class="text-sm font-medium w-8 text-center">${item.cantidad}</span>
                        <button onclick="cambiarCantidad(${item.id}, ${item.cantidad + 1})" 
                                class="w-6 h-6 bg-gray-200 rounded-full text-sm hover:bg-gray-300">+</button>
                        <button onclick="removerDelCarrito(${item.id})" 
                                class="text-red-500 ml-2 hover:text-red-700 text-sm">🗑️</button>
                    </div>
                </div>
            `).join('');
        }
    }
    
    // Actualizar total
    if (totalCarrito) {
        totalCarrito.textContent = `$${precioTotal.toFixed(2)}`;
    }
    
    // Habilitar/deshabilitar botón de checkout
    if (botonCheckout) {
        botonCheckout.disabled = carrito.length === 0;
        botonCheckout.classList.toggle('opacity-50', carrito.length === 0);
        botonCheckout.classList.toggle('cursor-not-allowed', carrito.length === 0);
    }
}

function mostrarNotificacionCarrito(nombreProducto) {
    // Crear notificación
    const notificacion = document.createElement('div');
    notificacion.className = 'fixed top-24 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-40 transform transition-transform duration-300 translate-x-full';
    notificacion.innerHTML = `
        <div class="flex items-center space-x-2">
            <i class="fas fa-check-circle"></i>
            <span>${nombreProducto} agregado al carrito</span>
        </div>
    `;
    
    document.body.appendChild(notificacion);
    
    // Animar entrada
    setTimeout(() => {
        notificacion.classList.remove('translate-x-full');
    }, 10);
    
    // Animar salida y remover
    setTimeout(() => {
        notificacion.classList.add('translate-x-full');
        setTimeout(() => {
            if (notificacion.parentNode) {
                notificacion.parentNode.removeChild(notificacion);
            }
        }, 300);
    }, 2000);
}

// --- RENDERIZADO DE PRODUCTOS ---
function renderizarProductos() {
    const contenedor = document.getElementById('product-list');
    if (!contenedor) {
        console.error('Contenedor de productos no encontrado');
        return;
    }
    
    console.log('Renderizando productos en contenedor:', contenedor);
    console.log('Productos disponibles:', productos);
    
    // Verificar que tenemos productos
    if (!productos || productos.length === 0) {
        console.error('No hay productos para mostrar');
        contenedor.innerHTML = '<p class="text-center text-gray-500">No hay productos disponibles</p>';
        return;
    }
    
    // Agrupar productos por categoría manteniendo el orden
    const categorias = ['Bocaditos Tradicionales', 'Bocaditos Gourmet'];
    
    let html = '';
    categorias.forEach(categoria => {
        const productosCategoria = productos.filter(p => p.categoria === categoria);
        console.log(`Productos en categoría ${categoria}:`, productosCategoria);
        
        if (productosCategoria.length > 0) {
            html += `
                <div class="col-span-full mb-8">
                    <h3 class="text-2xl font-bold text-brand-verde-oliva mb-6 text-center">${categoria}</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        ${productosCategoria.map(producto => `
                            <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                                <div class="aspect-square bg-gray-50 flex items-center justify-center p-4">
                                    <img src="${producto.imagen}" alt="${producto.nombre}" 
                                         class="max-w-full max-h-full object-contain rounded-lg">
                                </div>
                                <div class="p-6">
                                    <h3 class="font-bold text-lg text-gray-800 mb-2">${producto.nombre}</h3>
                                    <p class="text-gray-600 text-sm mb-3 leading-relaxed">${producto.descripcion}</p>
                                    <div class="flex justify-between items-center mb-3">
                                        <span class="text-2xl font-bold text-brand-naranja-mostaza">$${producto.precio.toFixed(2)}</span>
                                        <span class="text-sm text-gray-500">${producto.peso}</span>
                                    </div>
                                    <div class="space-y-2">
                                        <a href="${producto.pagina}" 
                                           class="w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 border-2 border-brand-naranja-mostaza text-brand-naranja-mostaza hover:bg-brand-naranja-mostaza hover:text-white flex items-center justify-center">
                                            <i class="fas fa-eye mr-2"></i>
                                            Ver Detalles
                                        </a>
                                        <button type="button" 
                                                onclick="agregarAlCarrito(${producto.id})"
                                                data-product-id="${producto.id}"
                                                class="btn-agregar-carrito w-full py-3 px-4 rounded-lg font-medium transition-all duration-200"
                                                style="background-color: #d79f49 !important; color: white !important; display: flex !important; align-items: center !important; justify-content: center !important; cursor: pointer !important; border: none !important;">
                                            <i class="fas fa-shopping-cart mr-2"></i>
                                            Agregar al Carrito
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    });
    
    if (html) {
        contenedor.innerHTML = html;
        console.log('HTML generado para productos:', html.length, 'caracteres');
        console.log('Productos renderizados exitosamente');
        
        // Asegurar visibilidad de botones después del renderizado
        setTimeout(() => {
            asegurarVisibilidadBotones();
        }, 100);
    } else {
        console.warn('No se generó HTML para productos');
        contenedor.innerHTML = '<p class="text-center text-gray-500">No hay productos disponibles en las categorías especificadas</p>';
    }
}

// --- MENÚ MÓVIL ---
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const isOpen = menu.classList.contains('max-h-96');
    
    if (isOpen) {
        menu.classList.remove('max-h-96');
        menu.classList.add('max-h-0');
    } else {
        menu.classList.remove('max-h-0');
        menu.classList.add('max-h-96');
    }
}

// Nueva función para inicializar el menú móvil
function inicializarMenuMovil() {
    console.log('📱 Inicializando menú móvil...');
    
    const menuButton = document.getElementById('mobile-menu-button');
    const menuPanel = document.getElementById('mobile-menu-panel');
    const closeMenuButton = document.getElementById('close-mobile-menu');
    const menuOverlay = document.getElementById('mobile-menu-overlay');
    
    if (menuButton && menuPanel) {
        menuButton.addEventListener('click', function() {
            menuPanel.classList.remove('-translate-x-full');
            menuOverlay.classList.remove('hidden');
            menuButton.setAttribute('aria-expanded', 'true');
        });
    }
    
    if (closeMenuButton && menuPanel) {
        closeMenuButton.addEventListener('click', function() {
            menuPanel.classList.add('-translate-x-full');
            menuOverlay.classList.add('hidden');
            menuButton.setAttribute('aria-expanded', 'false');
        });
    }
    
    if (menuOverlay && menuPanel) {
        menuOverlay.addEventListener('click', function() {
            menuPanel.classList.add('-translate-x-full');
            menuOverlay.classList.add('hidden');
            menuButton.setAttribute('aria-expanded', 'false');
        });
    }
    
    console.log('✅ Menú móvil inicializado');
}

// --- CARRITO SIDEBAR ---
function toggleCarrito() {
    const carrito = document.getElementById('carrito-sidebar');
    const overlay = document.getElementById('carrito-overlay');
    
    const isOpen = carrito.classList.contains('translate-x-0');
    
    if (isOpen) {
        carrito.classList.remove('translate-x-0');
        carrito.classList.add('translate-x-full');
        overlay.classList.add('hidden');
    } else {
        carrito.classList.remove('translate-x-full');
        carrito.classList.add('translate-x-0');
        overlay.classList.remove('hidden');
    }
}

function procederAlCheckout() {
    if (carrito.length === 0) {
        alert('Tu carrito está vacío');
        return;
    }
    
    // Guardar carrito en localStorage para el checkout
    localStorage.setItem('carritoCheckout', JSON.stringify(carrito));
    
    // Ir a la página de checkout
    window.location.href = 'checkout.html';
}

// --- FUNCIONES DE VISIBILIDAD DE BOTONES ---
function asegurarVisibilidadBotones() {
    console.log('🔧 Asegurando visibilidad de botones...');
    
    // Asegurar que todos los botones de compra sean visibles con estilos inline
    const botonesCompra = document.querySelectorAll('[onclick*="agregarAlCarrito"], .btn-agregar-carrito');
    console.log(`🔍 Encontrados ${botonesCompra.length} botones de compra`);
    
    botonesCompra.forEach((boton, index) => {
        console.log(`🔧 Configurando botón ${index + 1}`);
        
        // Aplicar estilos inline para garantizar visibilidad
        boton.style.setProperty('display', 'inline-flex', 'important');
        boton.style.setProperty('align-items', 'center', 'important');
        boton.style.setProperty('justify-content', 'center', 'important');
        boton.style.setProperty('width', '100%', 'important');
        boton.style.setProperty('background-color', '#d79f49', 'important');
        boton.style.setProperty('color', 'white', 'important');
        boton.style.setProperty('font-weight', '600', 'important');
        boton.style.setProperty('padding', '0.75rem 1rem', 'important');
        boton.style.setProperty('border-radius', '0.5rem', 'important');
        boton.style.setProperty('border', 'none', 'important');
        boton.style.setProperty('cursor', 'pointer', 'important');
        boton.style.setProperty('text-align', 'center', 'important');
        boton.style.setProperty('transition', 'all 0.2s ease-in-out', 'important');
        boton.style.setProperty('visibility', 'visible', 'important');
        boton.style.setProperty('opacity', '1', 'important');
        boton.style.setProperty('pointer-events', 'auto', 'important');
        boton.style.setProperty('z-index', '10', 'important');
        boton.style.setProperty('position', 'relative', 'important');
        
        // Agregar clase para identificación
        boton.classList.add('btn-agregar-carrito');
        
        // Verificar que el onclick esté presente
        if (!boton.onclick) {
            console.warn(`⚠️ Botón ${index + 1} no tiene función onclick asignada`);
        }
    });
    
    // Asegurar que el botón de checkout sea visible
    const botonCheckout = document.getElementById('checkout-button');
    if (botonCheckout) {
        botonCheckout.style.setProperty('background-color', '#d79f49', 'important');
        botonCheckout.style.setProperty('color', 'white', 'important');
        botonCheckout.style.setProperty('display', 'block', 'important');
        botonCheckout.style.setProperty('visibility', 'visible', 'important');
        console.log('✅ Botón de checkout configurado');
    } else {
        console.log('ℹ️ Botón de checkout no encontrado (normal si no estamos en la página principal)');
    }
    
    console.log(`✅ Visibilidad asegurada para ${botonesCompra.length} botones de compra`);
}

// Ejecutar la función de visibilidad cuando sea necesario
document.addEventListener('DOMContentLoaded', asegurarVisibilidadBotones);

// --- MAPA DE PUNTOS DE VENTA ---

// Datos de puntos de venta (coordenadas aproximadas de Ecuador)
const puntosDeVenta = [
    // Guayas
    {
        id: 1,
        nombre: "Supermaxi Policentro",
        tipo: "supermercado",
        lat: -2.1894,
        lng: -79.8890,
        ciudad: "Guayaquil",
        provincia: "Guayas",
        direccion: "Av. Francisco de Orellana, Policentro",
        telefono: "04-2680000"
    },
    {
        id: 2,
        nombre: "Mi Comisariato Urdesa",
        tipo: "supermercado",
        lat: -2.1651,
        lng: -79.9014,
        ciudad: "Guayaquil",
        provincia: "Guayas",
        direccion: "Av. Víctor Emilio Estrada, Urdesa",
        telefono: "04-2881500"
    },
    {
        id: 3,
        nombre: "Tienda Los Andes",
        tipo: "punto-venta",
        lat: -2.2105,
        lng: -79.8862,
        ciudad: "Guayaquil",
        provincia: "Guayas",
        direccion: "Av. 25 de Julio, Mapasingue",
        telefono: "04-2201234"
    },
    {
        id: 4,
        nombre: "Minimarket Tradición",
        tipo: "punto-venta",
        lat: -2.1709,
        lng: -79.9225,
        ciudad: "Guayaquil",
        provincia: "Guayas",
        direccion: "Malecón 2000, Zona Rosa",
        telefono: "04-2567890"
    },

    // Manabí
    {
        id: 5,
        nombre: "Supermaxi Manta",
        tipo: "supermercado",
        lat: -0.9677,
        lng: -80.7088,
        ciudad: "Manta",
        provincia: "Manabí",
        direccion: "Av. 4 de Noviembre, Centro Comercial Multiplaza",
        telefono: "05-2620000"
    },
    {
        id: 6,
        nombre: "Tía Portoviejo",
        tipo: "supermercado",
        lat: -1.0546,
        lng: -80.4545,
        ciudad: "Portoviejo",
        provincia: "Manabí",
        direccion: "Av. Universitaria, Centro",
        telefono: "05-2650000"
    },
    {
        id: 7,
        nombre: "Tienda Costa Verde",
        tipo: "punto-venta",
        lat: -0.9515,
        lng: -80.7340,
        ciudad: "Manta",
        provincia: "Manabí",
        direccion: "Av. Malecón, Sector Tarqui",
        telefono: "05-2923456"
    },
    {
        id: 8,
        nombre: "Despensa La Yuca",
        tipo: "punto-venta",
        lat: -1.0483,
        lng: -80.4501,
        ciudad: "Portoviejo",
        provincia: "Manabí",
        direccion: "Parque Central, Calle Chile",
        telefono: "05-2634567"
    },

    // Pichincha
    {
        id: 9,
        nombre: "Supermaxi Quicentro Sur",
        tipo: "supermercado",
        lat: -0.2575,
        lng: -78.5260,
        ciudad: "Quito",
        provincia: "Pichincha",
        direccion: "Av. Morán Valverde, Quicentro Sur",
        telefono: "02-3980000"
    },
    {
        id: 10,
        nombre: "Megamaxi CCI",
        tipo: "supermercado",
        lat: -0.1807,
        lng: -78.4678,
        ciudad: "Quito",
        provincia: "Pichincha",
        direccion: "Av. Amazonas y Naciones Unidas, CCI",
        telefono: "02-2980000"
    },
    {
        id: 11,
        nombre: "Tienda Andina",
        tipo: "punto-venta",
        lat: -0.2298,
        lng: -78.5249,
        ciudad: "Quito",
        provincia: "Pichincha",
        direccion: "Av. Teniente Hugo Ortiz, Sur de Quito",
        telefono: "02-2456789"
    },
    {
        id: 12,
        nombre: "Despensa del Ecuador",
        tipo: "punto-venta",
        lat: -0.2201,
        lng: -78.5123,
        ciudad: "Quito",
        provincia: "Pichincha",
        direccion: "La Mariscal, Zona Rosa",
        telefono: "02-2234567"
    },

    // Azuay
    {
        id: 13,
        nombre: "Coral Cuenca",
        tipo: "supermercado",
        lat: -2.8972,
        lng: -79.0058,
        ciudad: "Cuenca",
        provincia: "Azuay",
        direccion: "Av. España, Mall del Río",
        telefono: "07-4050000"
    },
    {
        id: 14,
        nombre: "Minimarket Austral",
        tipo: "punto-venta",
        lat: -2.9001,
        lng: -79.0059,
        ciudad: "Cuenca",
        provincia: "Azuay",
        direccion: "Av. de las Américas, Centro",
        telefono: "07-2876543"
    },

    // El Oro
    {
        id: 15,
        nombre: "Tía Machala",
        tipo: "supermercado",
        lat: -3.2581,
        lng: -79.9553,
        ciudad: "Machala",
        provincia: "El Oro",
        direccion: "Av. 25 de Junio, Centro Comercial Paseo Shopping",
        telefono: "07-2930000"
    },

    // Los Ríos
    {
        id: 16,
        nombre: "Akí Babahoyo",
        tipo: "supermercado",
        lat: -1.8049,
        lng: -79.5341,
        ciudad: "Babahoyo",
        provincia: "Los Ríos",
        direccion: "Av. 10 de Agosto, Centro",
        telefono: "05-2730000"
    }
];

// Variables globales del mapa
let mapaStores = null;
let marcadores = [];
let tipoFiltroActual = 'todos';

// Función para inicializar el mapa de puntos de venta
function initializeStoresMap() {
    // Verificar si Leaflet está disponible
    if (typeof L === 'undefined') {
        console.error('Leaflet no está disponible');
        return;
    }

    const mapContainer = document.getElementById('stores-map');
    if (!mapContainer) {
        console.log('Contenedor del mapa no encontrado');
        return;
    }

    try {
        // Crear el mapa centrado en Ecuador
        mapaStores = L.map('stores-map').setView([-1.8312, -78.1834], 6);

        // Agregar tile layer (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(mapaStores);

        // Agregar todos los marcadores inicialmente
        mostrarMarcadores('todos');

        // Event listeners para los botones de filtro
        setupMapFilters();

        console.log('Mapa de puntos de venta inicializado correctamente');
    } catch (error) {
        console.error('Error inicializando mapa de puntos de venta:', error);
    }
}

// Función para configurar los filtros del mapa
function setupMapFilters() {
    const buttons = {
        'show-all-stores': 'todos',
        'show-supermarkets': 'supermercado'
    };

    Object.entries(buttons).forEach(([buttonId, tipo]) => {
        const button = document.getElementById(buttonId);
        if (button) {
            button.addEventListener('click', () => {
                // Actualizar estado visual de botones
                updateActiveFilterButton(buttonId);
                // Mostrar marcadores filtrados
                mostrarMarcadores(tipo);
            });
        }
    });
}

// Función para actualizar el botón activo
function updateActiveFilterButton(activeButtonId) {
    const allButtons = [
        'show-all-stores',
        'show-supermarkets'
    ];

    allButtons.forEach(buttonId => {
        const button = document.getElementById(buttonId);
        if (button) {
            if (buttonId === activeButtonId) {
                button.className = 'bg-brand-naranja-mostaza text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors';
            } else {
                button.className = 'bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors';
            }
        }
    });
}

// Función para mostrar marcadores según el filtro
function mostrarMarcadores(tipoFiltro) {
    if (!mapaStores) return;

    // Limpiar marcadores existentes
    marcadores.forEach(marker => {
        mapaStores.removeLayer(marker);
    });
    marcadores = [];

    // Filtrar puntos según el tipo
    let puntosFiltrados;
    if (tipoFiltro === 'todos') {
        puntosFiltrados = puntosDeVenta;
    } else if (tipoFiltro === 'supermercado') {
        puntosFiltrados = puntosDeVenta.filter(punto => punto.tipo === 'supermercado');
    } else {
        puntosFiltrados = puntosDeVenta.filter(punto => punto.tipo === tipoFiltro);
    }

    // Agregar marcadores filtrados
    puntosFiltrados.forEach(punto => {
        const marker = crearMarcador(punto);
        marcadores.push(marker);
        marker.addTo(mapaStores);
    });

    // Ajustar vista del mapa si hay marcadores
    if (marcadores.length > 0) {
        const group = new L.featureGroup(marcadores);
        mapaStores.fitBounds(group.getBounds().pad(0.1));
    }

    tipoFiltroActual = tipoFiltro;
}

// Función para crear un marcador
function crearMarcador(punto) {
    // Iconos personalizados según el tipo
    const iconos = {
        supermercado: {
            icon: '🏪',
            color: '#3B82F6' // blue-500
        },
        'punto-venta': {
            icon: '🏬',
            color: '#10B981' // green-500
        }
    };

    const config = iconos[punto.tipo] || { icon: '📍', color: '#6B7280' };

    // Crear icono personalizado
    const customIcon = L.divIcon({
        html: `<div style="
            background-color: ${config.color};
            color: white;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            border: 3px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        ">${config.icon}</div>`,
        className: 'custom-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
    });

    // Crear contenido del popup
    const tipoTexto = punto.tipo === 'punto-venta' ? 'Punto de Venta' : capitalizarPrimeraLetra(punto.tipo);
    
    const popupContent = `
        <div class="font-sans max-w-xs">
            <h3 class="font-bold text-lg text-gray-800 mb-2">${punto.nombre}</h3>
            <div class="space-y-1 text-sm">
                <p><span class="font-medium">Tipo:</span> ${tipoTexto}</p>
                <p><span class="font-medium">Ciudad:</span> ${punto.ciudad}, ${punto.provincia}</p>
                <p><span class="font-medium">Dirección:</span> ${punto.direccion}</p>
                <p><span class="font-medium">Teléfono:</span> ${punto.telefono}</p>
            </div>
            <div class="mt-3 pt-3 border-t border-gray-200">
                <p class="text-xs text-gray-600">
                    <i class="fas fa-store mr-1"></i>
                    Punto de venta autorizado La Tierrita
                </p>
            </div>
        </div>
    `;

    // Crear marcador
    const marker = L.marker([punto.lat, punto.lng], { icon: customIcon })
        .bindPopup(popupContent, {
            maxWidth: 300,
            className: 'custom-popup'
        });

    return marker;
}

// Función auxiliar para capitalizar
function capitalizarPrimeraLetra(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Inicializar el mapa cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Esperar un poco para asegurar que Leaflet esté completamente cargado
    setTimeout(() => {
        initializeStoresMap();
    }, 100);
});

// --- FUNCIONALIDAD DEL FORMULARIO DE DISTRIBUIDORES CON EMAILJS ---
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar EmailJS
    if (typeof emailjs !== 'undefined') {
        emailjs.init("KsWcM0Owsw__6IAUT"); // Public Key de EmailJS
    }
    
    const distributorForm = document.getElementById('distributor-form');
    const formContainer = document.getElementById('form-container');
    const formConfirmation = document.getElementById('form-confirmation');
    
    if (distributorForm) {
        distributorForm.addEventListener('submit', manejarEnvioFormulario);
    }
    
    async function manejarEnvioFormulario(e) {
        e.preventDefault();
        
        // Validar formulario
        if (!validarFormulario()) {
            return;
        }
        
        // Mostrar estado de carga
        const submitBtn = distributorForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Enviando...';
        submitBtn.disabled = true;
        
        try {
            // Recopilar datos del formulario
            const formData = recopilarDatosFormulario();
            
            // Enviar email usando EmailJS
            await enviarEmailDistribuidor(formData);
            
            // Mostrar confirmación
            mostrarConfirmacion();
            
        } catch (error) {
            console.error('Error enviando formulario:', error);
            mostrarError('Hubo un problema al enviar el formulario. Por favor, inténtalo de nuevo.');
            
            // Restaurar botón
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }
    
    function validarFormulario() {
        const requiredFields = [
            'fullName',
            'phone', 
            'email',
            'location'
        ];
        
        let isValid = true;
        
        // Validar campos requeridos
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field || !field.value.trim()) {
                mostrarErrorCampo(field, 'Este campo es obligatorio');
                isValid = false;
            } else {
                limpiarErrorCampo(field);
            }
        });
        
        // Validar email
        const emailField = document.getElementById('email');
        if (emailField && emailField.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailField.value)) {
                mostrarErrorCampo(emailField, 'Por favor, ingresa un email válido');
                isValid = false;
            }
        }
        
        // Validar teléfono
        const phoneField = document.getElementById('phone');
        if (phoneField && phoneField.value) {
            const phoneRegex = /^[\+]?[\d\s\-\(\)]{8,}$/;
            if (!phoneRegex.test(phoneField.value)) {
                mostrarErrorCampo(phoneField, 'Por favor, ingresa un número de teléfono válido');
                isValid = false;
            }
        }
        
        // Validar al menos un tipo de cliente seleccionado
        const customerTypeBoxes = document.querySelectorAll('input[name="customerType"]:checked');
        if (customerTypeBoxes.length === 0) {
            mostrarError('Por favor, selecciona al menos un tipo de cliente objetivo.');
            isValid = false;
        }
        
        return isValid;
    }
    
    function mostrarErrorCampo(field, mensaje) {
        limpiarErrorCampo(field);
        
        field.classList.add('border-red-500');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'text-red-500 text-sm mt-1 error-message';
        errorDiv.textContent = mensaje;
        
        field.parentNode.appendChild(errorDiv);
    }
    
    function limpiarErrorCampo(field) {
        if (!field) return;
        
        field.classList.remove('border-red-500');
        
        const errorMsg = field.parentNode.querySelector('.error-message');
        if (errorMsg) {
            errorMsg.remove();
        }
    }
    
    function mostrarError(mensaje) {
        // Crear notificación de error
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 max-w-md';
        errorDiv.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-exclamation-circle mr-2"></i>
                <span>${mensaje}</span>
                <button class="ml-4 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(errorDiv);
        
        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }
    
    function recopilarDatosFormulario() {
        // Información de contacto
        const fullName = document.getElementById('fullName')?.value || '';
        const phone = document.getElementById('phone')?.value || '';
        const email = document.getElementById('email')?.value || '';
        const location = document.getElementById('location')?.value || '';
        const geolocation = document.getElementById('geolocation')?.value || '';
        
        // Perfil comercial
        const businessStatus = document.querySelector('input[name="businessStatus"]:checked')?.value || '';
        const businessName = document.getElementById('businessName')?.value || '';
        
        const customerTypes = Array.from(document.querySelectorAll('input[name="customerType"]:checked'))
            .map(cb => cb.value);
        const customerTypeOther = document.querySelector('input[name="customerTypeOther"]')?.value || '';
        if (customerTypeOther) {
            customerTypes.push(`Otro: ${customerTypeOther}`);
        }
        
        // Capacidad y logística
        const experience = document.getElementById('experience')?.value || '';
        const freezerStatus = document.querySelector('input[name="freezerStatus"]:checked')?.value || '';
        const delivery = document.getElementById('delivery')?.value || '';
        
        // Conociéndonos mejor
        const howYouKnow = document.getElementById('howYouKnow')?.value || '';
        const whyDistribute = document.getElementById('whyDistribute')?.value || '';
        const comments = document.getElementById('comments')?.value || '';
        
        return {
            // Información de contacto
            fullName,
            phone,
            email,
            location,
            geolocation,
            
            // Perfil comercial
            businessStatus,
            businessName,
            customerTypes: customerTypes.join(', '),
            
            // Capacidad y logística
            experience,
            freezerStatus,
            delivery,
            
            // Conociéndonos mejor
            howYouKnow,
            whyDistribute,
            comments,
            
            // Metadata
            fechaEnvio: new Date().toLocaleString('es-EC'),
            userAgent: navigator.userAgent
        };
    }
    
    async function enviarEmailDistribuidor(formData) {
        if (typeof emailjs === 'undefined') {
            throw new Error('EmailJS no está cargado');
        }
        
        // Configuración de EmailJS - IDs reales de La Tierrita
        const serviceID = 'service_1ylo4ll';
        const templateID = 'template_5zoc2e4';
        
        // Formatear el mensaje para el email
        const emailParams = {
            to_name: 'Equipo La Tierrita',
            from_name: formData.fullName,
            from_email: formData.email,
            subject: `Nuevo Distribuidor Interesado: ${formData.fullName}`,
            
            // Información de contacto
            full_name: formData.fullName,
            phone: formData.phone,
            email: formData.email,
            location: formData.location,
            coordinates: formData.geolocation,
            
            // Perfil comercial
            business_status: formData.businessStatus,
            business_name: formData.businessName || 'N/A',
            customer_types: formData.customerTypes,
            
            // Capacidad y logística
            experience: formData.experience || 'No especificado',
            freezer_status: formData.freezerStatus,
            delivery: formData.delivery || 'No especificado',
            
            // Conociéndonos mejor
            how_you_know: formData.howYouKnow || 'No especificado',
            why_distribute: formData.whyDistribute || 'No especificado',
            comments: formData.comments || 'Sin comentarios adicionales',
            
            // Metadata
            fecha_envio: formData.fechaEnvio,
            
            // Mensaje completo formateado
            message: formatearMensajeCompleto(formData)
        };
        
        // Enviar email
        const response = await emailjs.send(serviceID, templateID, emailParams);
        
        if (response.status !== 200) {
            throw new Error('Error enviando email');
        }
        
        return response;
    }
    
    function formatearMensajeCompleto(data) {
        return `
NUEVO DISTRIBUIDOR INTERESADO - LA TIERRITA

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 INFORMACIÓN DE CONTACTO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 Nombre completo: ${data.fullName}
📱 Teléfono (WhatsApp): ${data.phone}
📧 Email: ${data.email}
📍 Ubicación: ${data.location}
🗺️ Coordenadas: ${data.geolocation || 'No proporcionadas'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏢 PERFIL COMERCIAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💼 Estado del negocio: ${data.businessStatus}
🏪 Nombre comercial: ${data.businessName || 'N/A'}
🎯 Tipos de clientes objetivo: ${data.customerTypes}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚚 CAPACIDAD Y LOGÍSTICA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 Experiencia en alimentos: ${data.experience || 'No especificado'}
❄️ Equipos de congelación: ${data.freezerStatus}
🚛 Método de entrega: ${data.delivery || 'No especificado'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💭 CONOCIÉNDONOS MEJOR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🤝 Cómo conoció La Tierrita: ${data.howYouKnow || 'No especificado'}

💡 Por qué quiere distribuir: ${data.whyDistribute || 'No especificado'}

💬 Comentarios adicionales: ${data.comments || 'Sin comentarios adicionales'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 INFORMACIÓN DEL ENVÍO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🕐 Fecha y hora: ${data.fechaEnvio}
💻 Navegador: ${data.userAgent}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Este mensaje fue enviado automáticamente desde el formulario de distribuidores de latierrita.com
        `.trim();
    }
    
    function mostrarConfirmacion() {
        // Ocultar formulario y mostrar confirmación
        formContainer.style.display = 'none';
        formConfirmation.classList.remove('hidden');
        
        // Scroll hacia arriba para mostrar la confirmación
        formConfirmation.scrollIntoView({ behavior: 'smooth' });
        
        // Limpiar formulario (por si el usuario quiere volver)
        distributorForm.reset();
        
        // Limpiar errores
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(msg => msg.remove());
        
        const errorFields = document.querySelectorAll('.border-red-500');
        errorFields.forEach(field => field.classList.remove('border-red-500'));
        
        // Mostrar notificación de éxito
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 max-w-md';
        successDiv.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-check-circle mr-2"></i>
                <span>¡Formulario enviado exitosamente!</span>
                <button class="ml-4 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(successDiv);
        
        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.parentNode.removeChild(successDiv);
            }
        }, 5000);
    }
    
    // Agregar validación en tiempo real
    const formFields = document.querySelectorAll('#distributor-form input, #distributor-form textarea');
    formFields.forEach(field => {
        field.addEventListener('blur', () => {
            if (field.hasAttribute('required') && !field.value.trim()) {
                mostrarErrorCampo(field, 'Este campo es obligatorio');
            } else {
                limpiarErrorCampo(field);
            }
        });
        
        field.addEventListener('input', () => {
            limpiarErrorCampo(field);
        });
    });
});

// --- FUNCIONALIDAD ADICIONAL DEL MENÚ MÓVIL Y CARRITO ---
document.addEventListener('DOMContentLoaded', () => {
    // Menú móvil
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenuPanel = document.getElementById('mobile-menu-panel');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    const closeMobileMenu = document.getElementById('close-mobile-menu');
    
    if (mobileMenuButton && mobileMenuPanel) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenuPanel.classList.toggle('-translate-x-full');
            mobileMenuOverlay.classList.toggle('hidden');
        });
        
        if (closeMobileMenu) {
            closeMobileMenu.addEventListener('click', () => {
                mobileMenuPanel.classList.add('-translate-x-full');
                mobileMenuOverlay.classList.add('hidden');
            });
        }
        
        if (mobileMenuOverlay) {
            mobileMenuOverlay.addEventListener('click', () => {
                mobileMenuPanel.classList.add('-translate-x-full');
                mobileMenuOverlay.classList.add('hidden');
            });
        }
    }
    
    // Carrito
    const cartButton = document.getElementById('cart-button');
    const cartModal = document.getElementById('cart-modal');
    const closeCartButton = document.getElementById('close-cart-button');
    const checkoutButton = document.getElementById('checkout-button');
    
    if (cartButton && cartModal) {
        cartButton.addEventListener('click', () => {
            cartModal.classList.remove('hidden');
        });
        
        if (closeCartButton) {
            closeCartButton.addEventListener('click', () => {
                cartModal.classList.add('hidden');
            });
        }
        
        // Cerrar carrito al hacer click fuera
        cartModal.addEventListener('click', (e) => {
            if (e.target === cartModal) {
                cartModal.classList.add('hidden');
            }
        });
    }
    
    if (checkoutButton) {
        checkoutButton.addEventListener('click', procederAlCheckout);
    }
    
    // Botón scroll to top
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    if (scrollToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollToTopBtn.classList.remove('hidden');
            } else {
                scrollToTopBtn.classList.add('hidden');
            }
        });
        
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});

// Ejecutar la función de visibilidad cuando sea necesario
document.addEventListener('DOMContentLoaded', asegurarVisibilidadBotones);

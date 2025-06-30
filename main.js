// Este archivo contiene toda la lógica JS de la landing page de La Tierrita.
// Incluye: animación de introducción, menú móvil, productos, carrito, formulario distribuidores, geolocalización y mapa.
// El código debe ser copiado desde landing.js aquí y luego eliminar landing.js.

// (ver contenido anterior para detalles)

// --- ANIMACIÓN DE INTRODUCCIÓN ---
document.addEventListener('DOMContentLoaded', () => {
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
    
    // Inicializar productos y carrito
    renderizarProductos();
    actualizarCarrito();
    
    // Asegurar visibilidad de botones después de un pequeño delay
    setTimeout(() => {
        asegurarVisibilidadBotones();
    }, 100);
});

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
        ingredientes: "Plátano, grasa vegetal, cebollin, sal y queso."
    },
    {
        id: 7,
        nombre: "Torrejas de Verde",
        categoria: "Bocaditos Gourmet",
        imagen: "img/torrejas.jpg",
        descripcion: "Comida muy ecuatoriana con su crujiente sabor recordarás el desayuno de tu infancia.",
        precio: 3.00,
        peso: "400g",
        ingredientes: "Plátano, pimiento, cebolla colorada, cebollin, queso, cebolla blanca, sal y achiote."
    },
    {
        id: 8,
        nombre: "Muchines de Yuca",
        categoria: "Bocaditos Gourmet",
        imagen: "img/muchines de yuca.jpg",
        descripcion: "¡El clásico que nunca falla! Hechos con yuca 100% natural y rellenos de queso.",
        precio: 3.00,
        peso: "500g",
        ingredientes: "Yuca, sal, grasa vegetal y queso."
    },
];

// --- RENDERIZADO DE PRODUCTOS (al hacer clic en Añadir, mostrar modal antes de agregar) ---
function renderizarProductos() {
    const lista = document.getElementById('product-list');
    if (!lista) return;
    lista.innerHTML = '';
    // Agrupar por categoría
    const categorias = [
        { nombre: 'Bocaditos Tradicionales', color: 'bg-brand-amarillo-suave' },
        { nombre: 'Bocaditos Gourmet', color: 'bg-brand-amarillo-pastel' }
    ];
    categorias.forEach(cat => {
        // Título de categoría
        const catTitle = document.createElement('div');
        catTitle.className = `col-span-full text-2xl font-bold mb-2 mt-6 ${cat.color} rounded-lg py-2 px-4 text-gray-800`;
        catTitle.textContent = cat.nombre;
        catTitle.style.backgroundColor = cat.color === 'bg-brand-amarillo-suave' ? 'var(--brand-amarillo-suave)' : 'var(--brand-amarillo-pastel)';
        lista.appendChild(catTitle);
        // Productos de la categoría
        productos.filter(p => p.categoria === cat.nombre).forEach(producto => {
            const card = document.createElement('div');
            card.className = 'product-card bg-white rounded-lg shadow-lg overflow-hidden flex flex-col cursor-pointer transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2';
            card.innerHTML = `
                <div class="relative pb-[100%] bg-white">
                    <img src="${producto.imagen}" alt="[Imagen de ${producto.nombre}]" class="absolute h-full w-full object-contain">
                </div>
                <div class="p-6 flex-grow flex flex-col">
                    <h3 class="text-xl font-bold mb-2 text-gray-800">${producto.nombre}</h3>
                    <p class="text-gray-600 mb-2 flex-grow">${producto.descripcion}</p>
                    <div class="mb-2">
                        <span class="block text-xs font-semibold text-brand-verde-oliva uppercase tracking-wide">Peso</span>
                        <span class="text-sm text-gray-500">${producto.peso}</span>
                    </div>
                    <div class="flex justify-between items-center mt-2">
                        <span class="text-2xl font-bold text-brand-naranja-mostaza" style="color: var(--brand-naranja-mostaza);">$${producto.precio.toFixed(2)}</span>
                        <button data-id="${producto.id}" class="show-detail-btn bg-brand-naranja-mostaza text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-transform transform hover:scale-105" style="background-color: var(--brand-naranja-mostaza); color: white; display: inline-flex; align-items: center; justify-content: center;">
                            <i class="fas fa-plus mr-2"></i>Añadir
                        </button>
                    </div>
                </div>
            `;
            
            // Aplicar estilos inline para asegurar visibilidad
            card.style.backgroundColor = 'white';
            card.style.borderRadius = '0.5rem';
            card.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            card.style.overflow = 'hidden';
            card.style.display = 'flex';
            card.style.flexDirection = 'column';
            card.style.cursor = 'pointer';
            card.style.transition = 'all 0.3s ease-in-out';
            
            // Evento para mostrar modal desde cualquier parte de la tarjeta
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.show-detail-btn')) {
                    mostrarDetalleProducto(producto.id);
                }
            });
            // Evento para mostrar modal desde el botón Añadir
            const addButton = card.querySelector('.show-detail-btn');
            addButton.style.backgroundColor = 'var(--brand-naranja-mostaza)';
            addButton.style.color = 'white';
            addButton.style.border = 'none';
            addButton.style.padding = '0.5rem 1rem';
            addButton.style.borderRadius = '0.5rem';
            addButton.style.fontWeight = 'bold';
            addButton.style.cursor = 'pointer';
            addButton.style.display = 'inline-flex';
            addButton.style.alignItems = 'center';
            addButton.style.justifyContent = 'center';
            addButton.style.transition = 'all 0.2s ease-in-out';
            
            addButton.addEventListener('click', (e) => {
                e.stopPropagation();
                mostrarDetalleProducto(producto.id);
            });
            lista.appendChild(card);
        });
    });
}



// --- CARRITO DE COMPRAS (sincronizado con localStorage) ---
function obtenerCarrito() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

function guardarCarrito(carrito) {
    localStorage.setItem('cart', JSON.stringify(carrito));
}

function actualizarCarrito() {
    const cartCount = document.getElementById('cart-count');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const emptyMsg = document.getElementById('cart-empty-msg');
    
    // Validación de existencia de elementos
    if (!cartCount || !cartItems || !cartTotal) return;
    
    const carrito = obtenerCarrito();
    let total = 0;
    cartItems.innerHTML = '';
    
    if (carrito.length === 0) {
        if (emptyMsg) emptyMsg.style.display = '';
        cartTotal.textContent = '$0.00';
        cartCount.textContent = '0';
        return;
    }
    
    if (emptyMsg) emptyMsg.style.display = 'none';
    
    carrito.forEach(item => {
        const producto = productos.find(p => p.id === item.id);
        if (!producto) return;
        
        total += producto.precio * item.quantity;
        const div = document.createElement('div');
        div.className = 'flex items-center justify-between mb-4';
        div.innerHTML = `
            <div class="flex items-center gap-2">
                <img src="${producto.imagen}" alt="${producto.nombre}" class="w-12 h-12 object-cover rounded">
                <div>
                    <div class="font-bold text-brand-naranja-mostaza">${producto.nombre}</div>
                    <div class="text-sm text-gray-600">x${item.quantity}</div>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <span class="font-bold">$${(producto.precio * item.quantity).toFixed(2)}</span>
                <button class="text-red-500 hover:text-red-700" data-id="${item.id}" data-action="eliminar"><i class="fas fa-trash"></i></button>
            </div>
        `;
        cartItems.appendChild(div);
    });
    
    cartTotal.textContent = `$${total.toFixed(2)}`;
    cartCount.textContent = carrito.reduce((acc, item) => acc + item.quantity, 0);
    
    // Asegurar visibilidad de botones después de actualizar el carrito
    setTimeout(() => {
        asegurarVisibilidadBotones();
    }, 50);
}

function agregarAlCarrito(id) {
    const prod = productos.find(p => p.id === id);
    if (!prod) return;
    
    let carrito = obtenerCarrito();
    const idx = carrito.findIndex(item => item.id === id);
    
    if (idx > -1) {
        carrito[idx].quantity++;
    } else {
        carrito.push({
            id: prod.id,
            quantity: 1
        });
    }
    
    guardarCarrito(carrito);
    actualizarCarrito();
    
    // Mostrar el modal del carrito automáticamente después de agregar
    const cartModal = document.getElementById('cart-modal');
    if (cartModal) cartModal.classList.remove('hidden');
    
    // Google Analytics - Add to Cart Event
    if (typeof gtag !== 'undefined') {
        gtag('event', 'add_to_cart', {
            currency: 'USD',
            value: prod.precio,
            items: [{
                item_id: prod.id,
                item_name: prod.nombre,
                category: prod.categoria,
                quantity: 1,
                price: prod.precio
            }]
        });
    }
}

function eliminarDelCarrito(id) {
    let carrito = obtenerCarrito();
    carrito = carrito.filter(item => item.id !== id);
    guardarCarrito(carrito);
    actualizarCarrito();
}

document.addEventListener('click', e => {
    const target = e.target.closest('button[data-action]');
    if (!target) return;
    const id = parseInt(target.getAttribute('data-id'));
    const action = target.getAttribute('data-action');
    if (action === 'agregar') {
        agregarAlCarrito(id);
    } else if (action === 'eliminar') {
        eliminarDelCarrito(id);
    } else if (action === 'detalle') {
        mostrarDetalleProducto(id);
    }
});

document.getElementById('cart-button').addEventListener('click', () => {
    document.getElementById('cart-modal').classList.remove('hidden');
    actualizarCarrito();
});
document.getElementById('close-cart-button').addEventListener('click', () => {
    document.getElementById('cart-modal').classList.add('hidden');
});

// --- MODAL DE DETALLE DE PRODUCTO (agregar funcionalidad de añadir al carrito) ---
function mostrarDetalleProducto(id) {
    const prod = productos.find(p => p.id === id);
    if (!prod) return;
    const modal = document.getElementById('product-modal');
    const content = document.getElementById('product-modal-content');
    content.innerHTML = `
        <button id="close-product-modal" class="absolute top-4 right-4 text-2xl text-gray-500 hover:text-gray-800">&times;</button>
        <div class="grid md:grid-cols-2 gap-6">
            <img src="${prod.imagen}" alt="[Imagen de ${prod.nombre}]" class="w-full h-full object-contain rounded-l-lg">
            <div class="p-8 flex flex-col">
                <h2 class="text-3xl font-bold text-brand-naranja-mostaza mb-2">${prod.nombre}</h2>
                <p class="text-sm text-gray-500 mb-4">${prod.categoria}</p>
                <p class="text-gray-600 mb-6 flex-grow">${prod.descripcion}</p>
                <div class="mb-6">
                    <h4 class="font-bold text-lg mb-2">Peso</h4>
                    <p class="text-gray-600 mb-2">${prod.peso}</p>
                    <h4 class="font-bold text-lg mb-2">Ingredientes:</h4>
                    <p class="text-gray-600">${prod.ingredientes}</p>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-3xl font-bold text-brand-naranja-mostaza">$${prod.precio.toFixed(2)}</span>
                    <button data-id="${prod.id}" class="add-to-cart-btn bg-brand-naranja-mostaza text-white font-bold rounded-lg hover:bg-opacity-90 transition-transform transform hover:scale-105 px-6 py-3">Añadir al Carrito</button>
                </div>
            </div>
        </div>
    `;
    modal.classList.remove('hidden');
    document.getElementById('close-product-modal').addEventListener('click', () => modal.classList.add('hidden'));
    modal.onclick = e => { if (e.target === modal) modal.classList.add('hidden'); };
    // Evento para agregar al carrito desde el modal
    content.querySelector('.add-to-cart-btn').addEventListener('click', (e) => {
        agregarAlCarrito(prod.id);
        modal.classList.add('hidden');
    });
}

// --- MENÚ MÓVIL ---
document.getElementById('mobile-menu-button').addEventListener('click', () => {
    document.getElementById('mobile-menu-panel').classList.remove('-translate-x-full');
    document.getElementById('mobile-menu-overlay').classList.remove('hidden');
});
document.getElementById('close-mobile-menu').addEventListener('click', () => {
    document.getElementById('mobile-menu-panel').classList.add('-translate-x-full');
    document.getElementById('mobile-menu-overlay').classList.add('hidden');
});
document.getElementById('mobile-menu-overlay').addEventListener('click', () => {
    document.getElementById('mobile-menu-panel').classList.add('-translate-x-full');
    document.getElementById('mobile-menu-overlay').classList.add('hidden');
});

// --- BOTÓN FLOTANTE SCROLL TO TOP ---
const scrollBtn = document.getElementById('scrollToTopBtn');
window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        scrollBtn.classList.remove('hidden');
    } else {
        scrollBtn.classList.add('hidden');
    }
});
scrollBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// --- CHECKOUT FUNCTIONALITY ---
document.getElementById('checkout-button').addEventListener('click', () => {
    const cart = obtenerCarrito();
    
    if (cart.length === 0) {
        alert('Tu carrito está vacío. Agrega algunos productos antes de continuar.');
        return;
    }
    
    // Google Analytics - Begin Checkout Event
    if (typeof gtag !== 'undefined') {
        const cartValue = cart.reduce((total, item) => {
            const producto = productos.find(p => p.id === item.id);
            return total + (producto.precio * item.quantity);
        }, 0);
        
        gtag('event', 'begin_checkout', {
            currency: 'USD',
            value: cartValue,
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
    
    // Redirigir a la página de checkout
    window.location.href = 'checkout.html';
});

// --- FUNCIÓN PARA ASEGURAR VISIBILIDAD DE BOTONES ---
function asegurarVisibilidadBotones() {
    // Botón de checkout
    const checkoutBtn = document.getElementById('checkout-button');
    if (checkoutBtn) {
        checkoutBtn.style.display = 'block';
        checkoutBtn.style.width = '100%';
        checkoutBtn.style.backgroundColor = 'var(--brand-naranja-mostaza)';
        checkoutBtn.style.color = 'white';
        checkoutBtn.style.fontWeight = 'bold';
        checkoutBtn.style.padding = '0.75rem';
        checkoutBtn.style.borderRadius = '0.5rem';
        checkoutBtn.style.border = 'none';
        checkoutBtn.style.cursor = 'pointer';
        checkoutBtn.style.textAlign = 'center';
        checkoutBtn.style.transition = 'all 0.2s ease-in-out';
    }
    
    // Botón del carrito en el header
    const cartBtn = document.getElementById('cart-button');
    if (cartBtn) {
        cartBtn.style.display = 'inline-flex';
        cartBtn.style.alignItems = 'center';
        cartBtn.style.justifyContent = 'center';
        cartBtn.style.position = 'relative';
        cartBtn.style.color = '#6b7280';
        cartBtn.style.cursor = 'pointer';
        cartBtn.style.transition = 'color 0.2s ease-in-out';
    }
    
    // Botones de productos
    const addButtons = document.querySelectorAll('.show-detail-btn');
    addButtons.forEach(btn => {
        btn.style.display = 'inline-flex';
        btn.style.alignItems = 'center';
        btn.style.justifyContent = 'center';
        btn.style.backgroundColor = 'var(--brand-naranja-mostaza)';
        btn.style.color = 'white';
        btn.style.fontWeight = 'bold';
        btn.style.padding = '0.5rem 1rem';
        btn.style.borderRadius = '0.5rem';
        btn.style.border = 'none';
        btn.style.cursor = 'pointer';
        btn.style.transition = 'all 0.2s ease-in-out';
        btn.style.zIndex = '10';
        btn.style.position = 'relative';
    });
}

// Asegurar visibilidad de botones críticos al cargar
document.addEventListener('DOMContentLoaded', asegurarVisibilidadBotones);



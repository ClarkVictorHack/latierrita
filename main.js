// Este archivo contiene toda la lógica JS de la landing page de La Tierrita.
// Incluye: animación de introducción, menú móvil, productos, carrito, formulario distribuidores, geolocalización y mapa mejorados.

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

// --- GESTIÓN DEL CARRITO ---
let carrito = JSON.parse(localStorage.getItem('carritoLaTierrita')) || [];

function agregarAlCarrito(productoId) {
    const producto = productos.find(p => p.id === productoId);
    if (!producto) return;
    
    const itemExistente = carrito.find(item => item.id === productoId);
    if (itemExistente) {
        itemExistente.cantidad += 1;
    } else {
        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            imagen: producto.imagen,
            cantidad: 1
        });
    }
    
    guardarCarrito();
    actualizarCarrito();
    mostrarNotificacionCarrito(producto.nombre);
}

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
    localStorage.setItem('carritoLaTierrita', JSON.stringify(carrito));
}

function obtenerTotalCarrito() {
    return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
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
    const botonCheckout = document.getElementById('checkout-btn');
    
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
    notificacion.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transform transition-transform duration-300 translate-x-full';
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
    const contenedor = document.getElementById('productos-grid');
    if (!contenedor) return;
    
    // Agrupar productos por categoría manteniendo el orden
    const categorias = ['Bocaditos Tradicionales', 'Bocaditos Gourmet'];
    
    let html = '';
    categorias.forEach(categoria => {
        const productosCategoria = productos.filter(p => p.categoria === categoria);
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
                                    <button onclick="agregarAlCarrito(${producto.id})" 
                                            style="background-color: #d79f49 !important; color: white !important;" 
                                            class="w-full py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-brand-naranja-mostaza focus:ring-opacity-50">
                                        <i class="fas fa-shopping-cart mr-2"></i>
                                        Agregar al Carrito
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    });
    
    contenedor.innerHTML = html;
    
    // Asegurar visibilidad de botones después del renderizado
    setTimeout(asegurarVisibilidadBotones, 100);
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
    // Asegurar que todos los botones de compra sean visibles con estilos inline
    const botonesCompra = document.querySelectorAll('[onclick*="agregarAlCarrito"]');
    botonesCompra.forEach(boton => {
        boton.style.backgroundColor = '#d79f49';
        boton.style.color = 'white';
        boton.style.display = 'block';
        boton.style.visibility = 'visible';
        boton.style.opacity = '1';
        boton.style.pointerEvents = 'auto';
    });
    
    // Asegurar que el botón de checkout sea visible
    const botonCheckout = document.getElementById('checkout-btn');
    if (botonCheckout) {
        botonCheckout.style.backgroundColor = '#d79f49';
        botonCheckout.style.color = 'white';
        botonCheckout.style.display = 'block';
        botonCheckout.style.visibility = 'visible';
    }
    
    console.log(`Visibilidad asegurada para ${botonesCompra.length} botones de compra`);
}

// Ejecutar la función de visibilidad cuando sea necesario
document.addEventListener('DOMContentLoaded', asegurarVisibilidadBotones);

// --- GEOLOCALIZACIÓN Y MAPA MEJORADOS (Mapbox) ---
document.addEventListener('DOMContentLoaded', () => {
    const getLocationBtn = document.getElementById('getLocationBtn');
    const locationInput = document.getElementById('location');
    const geolocationInput = document.getElementById('geolocation');
    const mapContainer = document.getElementById('map-container');
    
    let map = null;
    let marker = null;
    
    // Token de Mapbox actualizado
    const MAPBOX_TOKEN = 'pk.eyJ1IjoibGF0aWVycml0YXNob3AiLCJhIjoiY21jOWFzMHM4MXcyZjJtb3BuZzU0ZnVjdSJ9.uvBJT6wvbCSwc_ia4bSzUQ';
    
    if (getLocationBtn) {
        getLocationBtn.addEventListener('click', obtenerUbicacion);
    }
    
    function obtenerUbicacion() {
        if (!navigator.geolocation) {
            alert('La geolocalización no es compatible con este navegador.');
            return;
        }
        
        // Mostrar estado de carga
        getLocationBtn.innerHTML = '<i class="fas fa-spinner fa-spin text-brand-naranja-mostaza"></i>';
        getLocationBtn.disabled = true;
        
        // Agregar texto de estado
        let statusDiv = document.getElementById('location-status');
        if (!statusDiv) {
            statusDiv = document.createElement('div');
            statusDiv.id = 'location-status';
            statusDiv.className = 'text-sm text-gray-600 mt-2';
            getLocationBtn.parentNode.appendChild(statusDiv);
        }
        statusDiv.textContent = 'Obteniendo tu ubicación...';
        statusDiv.className = 'text-sm text-gray-600 mt-2';
        
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                // Actualizar estado
                statusDiv.textContent = 'Procesando ubicación...';
                statusDiv.className = 'text-sm text-blue-600 mt-2';
                
                // Guardar coordenadas
                geolocationInput.value = `${lat},${lng}`;
                
                try {
                    // Obtener dirección usando la función mejorada
                    await procesarGeocoding(lat, lng);
                    
                    // Mostrar mapa
                    mostrarMapa(lat, lng);
                    
                    // Actualizar estado final
                    statusDiv.textContent = '✓ Ubicación obtenida correctamente';
                    statusDiv.className = 'text-sm text-green-600 mt-2';
                    
                    // Ocultar mensaje después de 3 segundos
                    setTimeout(() => {
                        if (statusDiv && statusDiv.parentNode) {
                            statusDiv.parentNode.removeChild(statusDiv);
                        }
                    }, 3000);
                    
                } catch (error) {
                    console.error('Error en geocodificación:', error);
                    // Mostrar mapa de todos modos
                    mostrarMapa(lat, lng);
                    
                    statusDiv.textContent = '⚠ Ubicación obtenida, dirección aproximada';
                    statusDiv.className = 'text-sm text-yellow-600 mt-2';
                    
                    setTimeout(() => {
                        if (statusDiv && statusDiv.parentNode) {
                            statusDiv.parentNode.removeChild(statusDiv);
                        }
                    }, 4000);
                }
                
                // Restaurar botón
                getLocationBtn.innerHTML = '<i class="fas fa-map-marker-alt text-brand-naranja-mostaza"></i>';
                getLocationBtn.disabled = false;
            },
            (error) => {
                console.error('Error obteniendo ubicación:', error);
                let mensaje = 'No se pudo obtener la ubicación. ';
                
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        mensaje += 'Permiso denegado por el usuario.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        mensaje += 'Información de ubicación no disponible.';
                        break;
                    case error.TIMEOUT:
                        mensaje += 'Tiempo de espera agotado.';
                        break;
                    default:
                        mensaje += 'Error desconocido.';
                        break;
                }
                
                // Actualizar estado de error
                if (statusDiv) {
                    statusDiv.textContent = '✗ ' + mensaje;
                    statusDiv.className = 'text-sm text-red-600 mt-2';
                    
                    // Ocultar mensaje después de 5 segundos
                    setTimeout(() => {
                        if (statusDiv && statusDiv.parentNode) {
                            statusDiv.parentNode.removeChild(statusDiv);
                        }
                    }, 5000);
                } else {
                    alert(mensaje);
                }
                
                // Restaurar botón
                getLocationBtn.innerHTML = '<i class="fas fa-map-marker-alt text-brand-naranja-mostaza"></i>';
                getLocationBtn.disabled = false;
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5 minutos
            }
        );
    }
    
    // Función mejorada para obtener dirección con Mapbox
    async function obtenerDireccion(lat, lng) {
        try {
            // Múltiples consultas a Mapbox para obtener información más específica
            const queries = [
                // Consulta para dirección específica con mayor precisión
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&language=es&types=address&limit=1&reverseMode=distance`,
                // Consulta para lugar/vecindario
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&language=es&types=poi,neighborhood&limit=1&reverseMode=distance`,
                // Consulta general con todos los tipos
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&language=es&types=address,poi,place,locality,neighborhood&limit=3&reverseMode=score`
            ];
            
            let direccionData = null;
            let mejorDireccion = null;
            
            // Intentar cada consulta hasta obtener buenos resultados
            for (const queryUrl of queries) {
                try {
                    const response = await fetch(queryUrl);
                    if (response.ok) {
                        const data = await response.json();
                        if (data.features && data.features.length > 0) {
                            direccionData = data;
                            mejorDireccion = data.features[0];
                            console.log('Mapbox consulta exitosa:', { query: queryUrl.split('types=')[1].split('&')[0], feature: mejorDireccion });
                            break;
                        }
                    }
                } catch (err) {
                    console.warn('Consulta Mapbox falló:', err);
                }
            }
            
            if (!mejorDireccion) {
                throw new Error('No se pudo obtener información de ubicación de Mapbox');
            }
            
            // Procesar información de Mapbox con lógica mejorada
            let calle = '';
            let numero = '';
            let barrio = '';
            let ciudad = '';
            let provincia = '';
            let codigoPostal = '';
            
            console.log('Procesando información de Mapbox:', mejorDireccion);
            
            const placeName = mejorDireccion.place_name || '';
            const placeText = mejorDireccion.text || '';
            const properties = mejorDireccion.properties || {};
            
            // Extraer número de dirección del address si está disponible
            if (properties.address) {
                numero = properties.address;
            }
            
            // Si es una dirección específica, extraer información detallada
            if (mejorDireccion.place_type && mejorDireccion.place_type.includes('address')) {
                calle = placeText;
                
                // Si no encontramos número en properties, intentar extraerlo del texto
                if (!numero) {
                    const numeroMatch = calle.match(/^(\d+[-\w]*)/);
                    if (numeroMatch) {
                        numero = numeroMatch[1];
                        calle = calle.replace(/^\d+[-\w]*\s*/, '').trim();
                    }
                }
            }
            
            // Procesar contexto jerárquico de Mapbox
            if (mejorDireccion.context) {
                mejorDireccion.context.forEach(item => {
                    const id = item.id || '';
                    const text = item.text || '';
                    
                    if (id.includes('neighborhood') || id.includes('locality')) {
                        if (!barrio) barrio = text;
                    } else if (id.includes('place') && !ciudad) {
                        ciudad = text;
                    } else if (id.includes('district') && !ciudad) {
                        ciudad = text;
                    } else if (id.includes('region') && !provincia) {
                        provincia = text;
                    } else if (id.includes('postcode')) {
                        codigoPostal = text;
                    }
                });
            }
            
            // Si no tenemos información suficiente de contexto, parsear el place_name
            if (!ciudad || !provincia) {
                const parts = placeName.split(',').map(part => part.trim());
                
                // Remover país si está presente
                if (parts.length > 0 && (parts[parts.length - 1].toLowerCase().includes('ecuador') || parts[parts.length - 1] === 'EC')) {
                    parts.pop();
                }
                
                // Asignar provincia (penúltima parte)
                if (parts.length > 0 && !provincia) {
                    provincia = parts.pop();
                }
                
                // Asignar ciudad (antepenúltima parte)
                if (parts.length > 0 && !ciudad) {
                    ciudad = parts.pop();
                }
                
                // Si hay más partes y no tenemos calle/barrio, usarlas
                if (parts.length > 0 && !calle && !barrio) {
                    const resto = parts.join(', ');
                    if (mejorDireccion.place_type && mejorDireccion.place_type.includes('address')) {
                        calle = resto;
                    } else {
                        barrio = resto;
                    }
                }
            }
            
            // Construir dirección final optimizada
            const direccionCompleta = construirDireccionCompleta({
                calle,
                numero,
                barrio,
                ciudad,
                provincia,
                codigoPostal
            });
            
            locationInput.value = direccionCompleta;
            
            console.log('Mapbox geocodificación exitosa:', {
                calle,
                numero,
                barrio,
                ciudad,
                provincia,
                codigoPostal,
                direccionCompleta,
                placeName
            });
            
            return true;
            
        } catch (error) {
            console.error('Error en geocodificación de Mapbox:', error);
            throw error; // Re-lanzar para que el fallback se ejecute
        }
    }
    
    // Función auxiliar para construir dirección de forma inteligente
    function construirDireccionCompleta({ calle, numero, barrio, ciudad, provincia, codigoPostal }) {
        const partes = [];
        
        // Agregar calle con número si están disponibles
        if (calle) {
            if (numero) {
                partes.push(`${calle} ${numero}`);
            } else {
                partes.push(calle);
            }
        }
        
        // Agregar barrio si es diferente de la ciudad
        if (barrio && barrio !== ciudad && !calle) {
            partes.push(barrio);
        }
        
        // Agregar ciudad
        if (ciudad) {
            partes.push(ciudad);
        }
        
        // Agregar provincia si es diferente de la ciudad
        if (provincia && provincia !== ciudad) {
            partes.push(provincia);
        }
        
        let direccion = partes.join(', ');
        
        // Si la dirección es muy corta, intentar mejoras
        if (partes.length < 2) {
            if (barrio && barrio !== ciudad) {
                direccion = [barrio, ciudad, provincia].filter(Boolean).join(', ');
            } else if (ciudad && provincia) {
                direccion = [ciudad, provincia].filter(Boolean).join(', ');
            }
        }
        
        return direccion || 'Ubicación no específica';
    }
    
    // Función mejorada para el fallback con Nominatim
    async function obtenerDireccionFallback(lat, lng) {
        try {
            console.log('Ejecutando fallback con Nominatim...');
            const osmResponse = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=es&addressdetails=1&zoom=18&extratags=1`,
                {
                    headers: {
                        'User-Agent': 'La Tierrita Distribuidor Form (contact@latierrita.com)'
                    }
                }
            );
            
            if (!osmResponse.ok) {
                throw new Error('Error en consulta a Nominatim');
            }
            
            const osmData = await osmResponse.json();
            const address = osmData.address || {};
            
            console.log('Respuesta de Nominatim:', osmData);
            
            let calle = address.road || address.street || address.footway || address.path || '';
            let numero = address.house_number || '';
            let barrio = address.neighbourhood || address.suburb || address.quarter || address.residential || '';
            let ciudad = address.city || address.town || address.village || address.municipality || address.county || '';
            let provincia = address.state || address.province || address.region || '';
            
            // Usar información adicional si está disponible
            if (!calle && address.pedestrian) calle = address.pedestrian;
            if (!barrio && address.city_district) barrio = address.city_district;
            
            const direccionCompleta = construirDireccionCompleta({
                calle,
                numero,
                barrio,
                ciudad,
                provincia
            });
            
            if (direccionCompleta && direccionCompleta !== 'Ubicación no específica') {
                locationInput.value = direccionCompleta;
                console.log('Fallback OSM exitoso:', { calle, numero, barrio, ciudad, provincia, direccionCompleta });
                return true;
            } else {
                throw new Error('Información insuficiente en fallback');
            }
            
        } catch (fallbackError) {
            console.error('Error en fallback Nominatim:', fallbackError);
            return false;
        }
    }
    
    // Función principal que maneja la obtención de dirección con fallback
    async function procesarGeocoding(lat, lng) {
        try {
            // Intentar Mapbox primero
            await obtenerDireccion(lat, lng);
        } catch (mapboxError) {
            console.warn('Mapbox falló, intentando fallback:', mapboxError);
            
            // Intentar fallback con Nominatim
            const fallbackExitoso = await obtenerDireccionFallback(lat, lng);
            
            if (!fallbackExitoso) {
                // Si todo falla, mostrar coordenadas
                locationInput.value = `Coordenadas: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                console.warn('Todos los servicios de geocodificación fallaron, mostrando coordenadas');
            }
        }
    }
    
    function mostrarMapa(lat, lng) {
        // Mostrar contenedor del mapa
        mapContainer.style.display = 'block';
        
        // Si ya existe un mapa, lo removemos completamente
        if (map) {
            map.remove();
            map = null;
        }
        
        // Pequeño delay para asegurar que el contenedor esté visible
        setTimeout(() => {
            try {
                // Crear nuevo mapa con Mapbox
                map = L.map('geoapify-map', {
                    center: [lat, lng],
                    zoom: 16,
                    zoomControl: true,
                    scrollWheelZoom: true,
                    doubleClickZoom: true,
                    boxZoom: true,
                    keyboard: true
                });
                
                // Agregar capa de Mapbox con el token correcto
                const mapboxTileLayer = L.tileLayer(`https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`, {
                    attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>',
                    tileSize: 512,
                    zoomOffset: -1,
                    maxZoom: 19
                });
                
                mapboxTileLayer.addTo(map);
                
                // Esperar a que la capa se cargue antes de agregar el marcador
                mapboxTileLayer.on('load', () => {
                    agregarMarcador(lat, lng);
                });
                
                // Agregar marcador inmediatamente también (por si 'load' no se dispara)
                setTimeout(() => {
                    agregarMarcador(lat, lng);
                }, 500);
                
                // Ajustar el tamaño del mapa después de que se renderice
                setTimeout(() => {
                    map.invalidateSize();
                    map.setView([lat, lng], 16);
                }, 200);
                
                console.log('Mapa creado correctamente:', { lat, lng, mapboxToken: MAPBOX_TOKEN.substring(0, 20) + '...' });
                
            } catch (error) {
                console.error('Error creando el mapa:', error);
                // Mostrar mensaje de error en el contenedor del mapa
                document.getElementById('geoapify-map').innerHTML = `
                    <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f5f5f5; color: #666; text-align: center; padding: 20px;">
                        <div>
                            <i class="fas fa-map-marker-alt" style="font-size: 48px; color: #d79f49; margin-bottom: 10px;"></i><br>
                            <strong>Error al cargar el mapa</strong><br>
                            <small>Ubicación: ${lat.toFixed(4)}, ${lng.toFixed(4)}</small>
                        </div>
                    </div>
                `;
            }
        }, 100);
    }
    
    function agregarMarcador(lat, lng) {
        if (!map) return;
        
        try {
            // Remover marcador anterior si existe
            if (marker) {
                map.removeLayer(marker);
                marker = null;
            }
            
            // Crear icono personalizado más visible
            const customIcon = L.divIcon({
                html: `
                    <div style="position: relative;">
                        <i class="fas fa-map-marker-alt" style="color: #d79f49; font-size: 32px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);"></i>
                        <div style="position: absolute; top: 8px; left: 50%; transform: translateX(-50%); width: 6px; height: 6px; background: white; border-radius: 50%; border: 1px solid #d79f49;"></div>
                    </div>
                `,
                iconSize: [32, 40],
                iconAnchor: [16, 40],
                popupAnchor: [0, -40],
                className: 'custom-marker-icon'
            });
            
            // Crear marcador con popup
            marker = L.marker([lat, lng], { icon: customIcon })
                .addTo(map)
                .bindPopup(`
                    <div style="text-align: center; padding: 8px; min-width: 200px;">
                        <strong style="color: #d79f49;">📍 Tu ubicación actual</strong><br>
                        <div style="margin: 8px 0; padding: 6px; background: #f8f9fa; border-radius: 4px; font-size: 12px;">
                            <strong>Coordenadas:</strong><br>
                            Lat: ${lat.toFixed(6)}<br>
                            Lng: ${lng.toFixed(6)}
                        </div>
                        <small style="color: #666;">Click en el mapa para explorar</small>
                    </div>
                `, {
                    maxWidth: 250,
                    className: 'custom-popup'
                })
                .openPopup();
            
            console.log('Marcador agregado correctamente:', { lat, lng });
            
        } catch (error) {
            console.error('Error agregando marcador:', error);
        }
    }
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

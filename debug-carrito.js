// Script de depuración para el carrito de La Tierrita
// Este archivo ayuda a diagnosticar problemas con la funcionalidad del carrito

console.log('🔍 INICIANDO DEPURACIÓN DEL CARRITO');

// Función para revisar el estado general
function debugGeneral() {
    console.group('📊 ESTADO GENERAL');
    console.log('✅ DOM cargado:', document.readyState);
    console.log('✅ Productos definidos:', typeof productos !== 'undefined');
    console.log('✅ Cantidad de productos:', productos ? productos.length : 0);
    console.log('✅ Carrito definido:', typeof carrito !== 'undefined');
    console.log('✅ Items en carrito:', carrito ? carrito.length : 0);
    console.groupEnd();
}

// Función para revisar los productos
function debugProductos() {
    console.group('🛍️ PRODUCTOS');
    if (typeof productos !== 'undefined') {
        productos.forEach((producto, index) => {
            console.log(`Producto ${index + 1}:`, {
                id: producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                categoria: producto.categoria
            });
        });
    } else {
        console.error('❌ Variable productos no está definida');
    }
    console.groupEnd();
}

// Función para revisar los botones
function debugBotones() {
    console.group('🔘 BOTONES');
    
    const botonesCompra = document.querySelectorAll('[onclick*="agregarAlCarrito"]');
    console.log('✅ Botones "Agregar al Carrito" encontrados:', botonesCompra.length);
    
    botonesCompra.forEach((boton, index) => {
        const estilos = window.getComputedStyle(boton);
        console.log(`Botón ${index + 1}:`, {
            visible: estilos.display !== 'none',
            display: estilos.display,
            visibility: estilos.visibility,
            opacity: estilos.opacity,
            pointerEvents: estilos.pointerEvents,
            backgroundColor: estilos.backgroundColor,
            onclick: boton.onclick ? boton.onclick.toString() : 'No definido'
        });
    });
    
    const botonCarrito = document.getElementById('cart-button');
    if (botonCarrito) {
        console.log('✅ Botón del carrito encontrado');
    } else {
        console.error('❌ Botón del carrito no encontrado');
    }
    
    const contenedorProductos = document.getElementById('product-list');
    if (contenedorProductos) {
        console.log('✅ Contenedor de productos encontrado');
        console.log('HTML interno (primeros 500 chars):', contenedorProductos.innerHTML.substring(0, 500));
    } else {
        console.error('❌ Contenedor de productos no encontrado');
    }
    
    console.groupEnd();
}

// Función para revisar el carrito
function debugCarrito() {
    console.group('🛒 CARRITO');
    
    if (typeof carrito !== 'undefined') {
        console.log('Items en carrito:', carrito);
        console.log('Cantidad total:', typeof obtenerCantidadTotal === 'function' ? obtenerCantidadTotal() : 'Función no disponible');
        console.log('Precio total:', typeof obtenerTotalCarrito === 'function' ? obtenerTotalCarrito() : 'Función no disponible');
        
        // Revisar localStorage
        const carritoLS = localStorage.getItem('cart');
        console.log('Carrito en localStorage:', carritoLS ? JSON.parse(carritoLS) : 'Vacío');
    } else {
        console.error('❌ Variable carrito no está definida');
    }
    
    console.groupEnd();
}

// Función para probar agregar un producto manualmente
function testAgregarProducto() {
    console.group('🧪 TEST AGREGAR PRODUCTO');
    
    if (typeof agregarAlCarrito === 'function' && typeof productos !== 'undefined' && productos.length > 0) {
        const primerProducto = productos[0];
        console.log('Probando agregar producto:', primerProducto.nombre);
        
        try {
            agregarAlCarrito(primerProducto.id);
            console.log('✅ Función agregarAlCarrito ejecutada sin errores');
        } catch (error) {
            console.error('❌ Error al ejecutar agregarAlCarrito:', error);
        }
    } else {
        console.error('❌ No se puede probar: función o productos no disponibles');
    }
    
    console.groupEnd();
}

// Función para simular clicks en botones
function testClickBotones() {
    console.group('🖱️ TEST CLICKS EN BOTONES');
    
    const botonesCompra = document.querySelectorAll('[onclick*="agregarAlCarrito"]');
    if (botonesCompra.length > 0) {
        const primerBoton = botonesCompra[0];
        console.log('Simulando click en primer botón...');
        
        try {
            primerBoton.click();
            console.log('✅ Click simulado ejecutado');
        } catch (error) {
            console.error('❌ Error al simular click:', error);
        }
    } else {
        console.error('❌ No hay botones disponibles para probar');
    }
    
    console.groupEnd();
}

// Ejecutar todas las funciones de depuración
function ejecutarDepuracion() {
    console.clear();
    console.log('🔍 DEPURACIÓN COMPLETA DEL CARRITO - La Tierrita');
    console.log('=====================================');
    
    debugGeneral();
    debugProductos();
    debugBotones();
    debugCarrito();
    testAgregarProducto();
    testClickBotones();
    
    console.log('=====================================');
    console.log('✅ Depuración completada');
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(ejecutarDepuracion, 2000); // Esperar 2 segundos para que todo se cargue
    });
} else {
    setTimeout(ejecutarDepuracion, 2000);
}

// Exponer función para uso manual
window.debugCarrito = ejecutarDepuracion;

// Agregar listener para detectar errores JavaScript
window.addEventListener('error', (e) => {
    console.error('❌ ERROR JAVASCRIPT DETECTADO:', {
        mensaje: e.message,
        archivo: e.filename,
        linea: e.lineno,
        columna: e.colno,
        error: e.error
    });
});

console.log('🔍 Script de depuración cargado. Ejecuta debugCarrito() para depuración manual.');

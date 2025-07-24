/**
 * Menú Móvil Responsivo - La Tierrita
 * Sistema de navegación hamburguesa para dispositivos móviles
 */

// Funciones del menú móvil
function toggleMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const overlay = document.querySelector('.menu-overlay');
  
  if (!hamburger || !mobileMenu || !overlay) return;
  
  hamburger.classList.toggle('active');
  mobileMenu.classList.toggle('active');
  overlay.classList.toggle('active');
  
  // Prevenir scroll del body cuando el menú está abierto
  document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : 'auto';
}

function closeMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const overlay = document.querySelector('.menu-overlay');
  
  if (!hamburger || !mobileMenu || !overlay) return;
  
  hamburger.classList.remove('active');
  mobileMenu.classList.remove('active');
  overlay.classList.remove('active');
  
  // Restaurar scroll del body
  document.body.style.overflow = 'auto';
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
  // Cerrar menú al redimensionar ventana
  window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
      closeMobileMenu();
    }
  });

  // Cerrar menú con tecla Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeMobileMenu();
    }
  });

  // Smooth scroll para links internos
  document.querySelectorAll('.mobile-menu a[href^="#"]').forEach(link => {
    link.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        e.preventDefault();
        closeMobileMenu();
        
        // Esperar a que se cierre el menú antes del scroll
        setTimeout(() => {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }, 300);
      }
    });
  });
});

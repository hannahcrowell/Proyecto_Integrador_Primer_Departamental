// Smooth scrolling para los enlaces de navegación
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Animación de entrada para las tarjetas
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Aplicar animación a todas las tarjetas
document.querySelectorAll('.card').forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = `all 0.6s ease ${index * 0.1}s`;
    observer.observe(card);
});

// Función para verificar si los enlaces funcionan correctamente
function checkLinks() {
    const links = document.querySelectorAll('.card-link');
    console.log('Enlaces encontrados:', links.length);
    
    links.forEach((link, index) => {
        console.log(`Enlace ${index + 1}: ${link.href}`);
    });
}

// Ejecutar verificación cuando la página cargue
document.addEventListener('DOMContentLoaded', function() {
    console.log('Landing page cargada correctamente');
    // Descomenta la siguiente línea para verificar enlaces
    // checkLinks();
});
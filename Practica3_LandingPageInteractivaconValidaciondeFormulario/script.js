// JAVASCRIPT PARA LANDING PAGE DE CAFÉ - VALIDACIONES Y ANIMACIONES

// === VARIABLES GLOBALES ===
const contactForm = document.getElementById('contactForm');
const subscribeBtn = document.getElementById('subscribeBtn');
const modal = document.getElementById('successModal');
const closeModal = document.querySelector('.close');
const confettiContainer = document.getElementById('confetti-container');

// Expresión regular para validar email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// === INICIALIZACIÓN AL CARGAR LA PÁGINA ===
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    addScrollAnimations();
});

// === CONFIGURACIÓN DE EVENT LISTENERS ===
function initializeEventListeners() {
    // Validación en tiempo real del formulario
    setupFormValidation();
    
    // Evento de envío del formulario
    contactForm.addEventListener('submit', handleFormSubmit);
    
    // Botón de suscripción con confeti
    subscribeBtn.addEventListener('click', handleSubscription);
    
    // Cerrar modal
    closeModal.addEventListener('click', closeSuccessModal);
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeSuccessModal();
        }
    });
    
    // Navegación suave
    setupSmoothNavigation();
}

// === VALIDACIÓN DEL FORMULARIO ===
function setupFormValidation() {
    const nombreInput = document.getElementById('nombre');
    const emailInput = document.getElementById('email');
    const mensajeInput = document.getElementById('mensaje');
    
    nombreInput.addEventListener('input', function() {
        validateName(this.value, 'nombreError');
    });
    nombreInput.addEventListener('blur', function() {
        validateName(this.value, 'nombreError');
    });
    
    emailInput.addEventListener('input', function() {
        validateEmail(this.value, 'emailError');
    });
    emailInput.addEventListener('blur', function() {
        validateEmail(this.value, 'emailError');
    });
    
    mensajeInput.addEventListener('input', function() {
        validateMessage(this.value, 'mensajeError');
    });
    mensajeInput.addEventListener('blur', function() {
        validateMessage(this.value, 'mensajeError');
    });
}

// === FUNCIONES DE VALIDACIÓN INDIVIDUAL ===
function validateName(name, errorElementId) {
    const errorElement = document.getElementById(errorElementId);
    const nameInput = document.getElementById('nombre');
    
    name = name.trim();
    if (name === '') {
        showError(errorElement, nameInput, 'El nombre es obligatorio');
        return false;
    } else if (name.length < 2) {
        showError(errorElement, nameInput, 'El nombre debe tener al menos 2 caracteres');
        return false;
    } else if (name.length > 50) {
        showError(errorElement, nameInput, 'El nombre no puede exceder 50 caracteres');
        return false;
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name)) {
        showError(errorElement, nameInput, 'El nombre solo puede contener letras y espacios');
        return false;
    } else {
        hideError(errorElement, nameInput);
        return true;
    }
}

function validateEmail(email, errorElementId) {
    const errorElement = document.getElementById(errorElementId);
    const emailInput = document.getElementById('email');
    
    email = email.trim();
    if (email === '') {
        showError(errorElement, emailInput, 'El email es obligatorio');
        return false;
    } else if (!emailRegex.test(email)) {
        showError(errorElement, emailInput, 'Ingresa un email válido (ejemplo: usuario@dominio.com)');
        return false;
    } else if (email.length > 100) {
        showError(errorElement, emailInput, 'El email no puede exceder 100 caracteres');
        return false;
    } else {
        hideError(errorElement, emailInput);
        return true;
    }
}

function validateMessage(message, errorElementId) {
    const errorElement = document.getElementById(errorElementId);
    const messageInput = document.getElementById('mensaje');
    
    message = message.trim();
    if (message === '') {
        showError(errorElement, messageInput, 'El mensaje es obligatorio');
        return false;
    } else if (message.length < 10) {
        showError(errorElement, messageInput, 'El mensaje debe tener al menos 10 caracteres');
        return false;
    } else if (message.length > 500) {
        showError(errorElement, messageInput, 'El mensaje no puede exceder 500 caracteres');
        return false;
    } else {
        hideError(errorElement, messageInput);
        return true;
    }
}

// === FUNCIONES AUXILIARES PARA MOSTRAR/OCULTAR ERRORES ===
function showError(errorElement, inputElement, message) {
    errorElement.textContent = message;
    errorElement.classList.add('show');
    inputElement.classList.add('error');
}

function hideError(errorElement, inputElement) {
    errorElement.textContent = '';
    errorElement.classList.remove('show');
    inputElement.classList.remove('error');
}

// === MANEJO DEL ENVÍO DEL FORMULARIO ===
function handleFormSubmit(event) {
    event.preventDefault();
    
    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('email').value.trim();
    const mensaje = document.getElementById('mensaje').value.trim();
    
    const isNameValid = validateName(nombre, 'nombreError');
    const isEmailValid = validateEmail(email, 'emailError');
    const isMessageValid = validateMessage(mensaje, 'mensajeError');
    
    if (isNameValid && isEmailValid && isMessageValid) {
        submitFormData(nombre, email, mensaje);
    } else {
        const submitButton = contactForm.querySelector('.submit-button');
        submitButton.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            submitButton.style.animation = '';
        }, 500);
        focusFirstErrorField();
    }
}

function submitFormData(nombre, email, mensaje) {
    const submitButton = contactForm.querySelector('.submit-button');
    const originalText = submitButton.textContent;
    
    submitButton.textContent = 'Enviando...';
    submitButton.disabled = true;
    
    setTimeout(() => {
        contactForm.reset();
        clearAllErrors();
        showSuccessModal();
        createConfetti(); // confeti al enviar formulario
        submitButton.textContent = originalText;
        submitButton.disabled = false;
        
        console.log('Formulario enviado exitosamente:', { nombre, email, mensaje });
    }, 2000);
}

function clearAllErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    const inputElements = document.querySelectorAll('.form-group input, .form-group textarea');
    errorElements.forEach(error => {
        error.textContent = '';
        error.classList.remove('show');
    });
    inputElements.forEach(input => {
        input.classList.remove('error');
    });
}

function focusFirstErrorField() {
    const errorFields = document.querySelectorAll('.form-group input.error, .form-group textarea.error');
    if (errorFields.length > 0) {
        errorFields[0].focus();
    }
}

// === MANEJO DE LA SUSCRIPCIÓN CON CONFETI ===
function handleSubscription(event) {
    event.preventDefault();
    
    const button = event.target;
    const originalText = button.textContent;
    
    button.textContent = '¡Suscribiendo...!';
    button.disabled = true;
    button.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
        button.textContent = '¡Suscrito! ✨';
        button.style.background = 'linear-gradient(45deg, #27ae60, #2ecc71)';
        
        // Confeti abundante (100 piezas)
        createConfetti(100);
        
        setTimeout(() => {
            button.textContent = originalText;
            button.disabled = false;
            button.style.transform = '';
            button.style.background = '';
        }, 3000);
    }, 1000);
}

// === SISTEMA DE MODAL ===
function showSuccessModal() {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}
function closeSuccessModal() {
    modal.style.display = 'none';
    document.body.style.overflow = '';
}

// === ANIMACIÓN DE CONFETI ===
function createConfetti(pieces = 15) {
    const colors = ['#8B4513', '#D2691E', '#F4A460', '#DEB887', '#CD853F', '#A0522D', '#FFD700', '#FF69B4', '#87CEFA'];
    
    for (let i = 0; i < pieces; i++) {
        createConfettiPiece(colors);
    }
}

function createConfettiPiece(colors) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti-piece';
    
    const startX = Math.random() * window.innerWidth;
    const startY = -10;
    
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = Math.random() * 8 + 5;
    const animationDuration = Math.random() * 2 + 3; // más lento
    const rotationSpeed = Math.random() * 720;
    
    confetti.style.left = startX + 'px';
    confetti.style.top = startY + 'px';
    confetti.style.backgroundColor = color;
    confetti.style.width = size + 'px';
    confetti.style.height = size + 'px';
    confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
    confetti.style.position = 'fixed';
    confetti.style.zIndex = 9999;
    confetti.style.animationDuration = animationDuration + 's';
    
    const keyframeName = 'confetti-' + Math.random().toString(36).substr(2, 9);
    const keyframes = `
        @keyframes ${keyframeName} {
            0% {
                transform: translateY(-10px) rotate(0deg);
                opacity: 1;
            }
            100% {
                transform: translateY(${window.innerHeight + 10}px) rotate(${rotationSpeed}deg);
                opacity: 0;
            }
        }
    `;
    
    const style = document.createElement('style');
    style.textContent = keyframes;
    document.head.appendChild(style);
    
    confetti.style.animationName = keyframeName;
    confetti.style.animationTimingFunction = 'linear';
    confetti.style.animationFillMode = 'forwards';
    
    confettiContainer.appendChild(confetti);
    
    setTimeout(() => {
        if (confetti.parentNode) confetti.parentNode.removeChild(confetti);
        if (style.parentNode) style.parentNode.removeChild(style);
    }, animationDuration * 1000 + 100);
}

// === NAVEGACIÓN SUAVE ===
function setupSmoothNavigation() {
    const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                const headerHeight = document.querySelector('.main-header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight - 20;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            }
        });
    });
}

// === ANIMACIONES AL SCROLL ===
function addScrollAnimations() {
    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    const animatedElements = document.querySelectorAll('.producto-card, .stat');
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(element);
    });
}

// === ANIMACIÓN DE SHAKE PARA ERRORES ===
const shakeAnimation = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
`;
const shakeStyle = document.createElement('style');
shakeStyle.textContent = shakeAnimation;
document.head.appendChild(shakeStyle);

// === FUNCIONES AUXILIARES ===
function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    const toastStyles = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;
    const successColor = 'background: linear-gradient(45deg, #27ae60, #2ecc71);';
    const errorColor = 'background: linear-gradient(45deg, #e74c3c, #c0392b);';
    toast.style.cssText = toastStyles + (type === 'success' ? successColor : errorColor);
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
    }, 100);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 300);
    }, 3000);
}

// === MANEJO DE ERRORES GLOBALES ===
window.addEventListener('error', function(event) {
    console.error('Error en la aplicación:', event.error);
});

// === OPTIMIZACIÓN DE PERFORMANCE ===
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
const debouncedValidation = debounce(function(inputElement, validationFunction, errorId) {
    validationFunction(inputElement.value, errorId);
}, 300);

console.log('🎉 Landing page de café inicializada correctamente');
console.log('📝 Formulario de contacto con validación en tiempo real activado');
console.log('🎊 Animación de confeti configurada');
console.log('✨ ¡Disfruta navegando por Aroma Dreams!');

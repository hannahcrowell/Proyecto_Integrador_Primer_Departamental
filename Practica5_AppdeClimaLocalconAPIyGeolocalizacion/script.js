// Configuración de la API de OpenWeatherMap
const API_KEY = 'e214c23e7ecdee6fa8056df41902e735';
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Referencias a elementos del DOM
const elements = {
    loadingSpinner: document.getElementById('loading-spinner'),
    citySearch: document.getElementById('city-search'),
    weatherCard: document.getElementById('weather-card'),
    errorMessage: document.getElementById('error-message'),
    cityInput: document.getElementById('city-input'),
    searchBtn: document.getElementById('search-btn'),
    refreshBtn: document.getElementById('refresh-btn'),
    retryBtn: document.getElementById('retry-btn'),
    rainParticles: document.getElementById('rain-particles'),
    snowParticles: document.getElementById('snow-particles')
};

// Variables globales
let currentWeatherData = null;
let isUsingGeolocation = true;
let currentCoordinates = null; // Agregar variable para coordenadas actuales

/**
 * Inicializar la aplicación
 */
function initApp() {
    console.log('Iniciando aplicación del clima...');
    
    // Mostrar spinner de carga
    showElement(elements.loadingSpinner);
    
    // Configurar event listeners
    setupEventListeners();
    
    // Intentar obtener ubicación del usuario
    getCurrentLocation();
}

/**
 * Configurar todos los event listeners
 */
function setupEventListeners() {
    // Asegurarse de que los elementos existen antes de agregar listeners
    if (!elements.searchBtn || !elements.cityInput || !elements.refreshBtn || !elements.retryBtn) {
        console.error('Error: Algunos elementos del DOM no fueron encontrados');
        return;
    }

    // Botón de búsqueda
    elements.searchBtn.addEventListener('click', handleCitySearch);
    
    // Input de ciudad (Enter para buscar)
    elements.cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleCitySearch();
        }
    });
    
    // Botón de actualizar - ARREGLADO
    elements.refreshBtn.addEventListener('click', (e) => {
        e.preventDefault(); // Prevenir comportamiento por defecto
        refreshWeatherData();
    });
    
    // Botón de reintentar
    elements.retryBtn.addEventListener('click', (e) => {
        e.preventDefault();
        initApp();
    });
}

/**
 * Obtener ubicación actual del usuario usando geolocalización
 */
function getCurrentLocation() {
    console.log('Solicitando ubicación del usuario...');
    
    // Verificar si el navegador soporta geolocalización
    if (!navigator.geolocation) {
        console.error('Geolocalización no soportada');
        handleGeolocationError('Geolocalización no soportada por este navegador');
        return;
    }
    
    // Opciones para la geolocalización
    const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutos
    };
    
    // Solicitar ubicación
    navigator.geolocation.getCurrentPosition(
        handleGeolocationSuccess,
        handleGeolocationError,
        options
    );
}

/**
 * Manejar éxito en obtener geolocalización
 * @param {GeolocationPosition} position - Posición del usuario
 */
function handleGeolocationSuccess(position) {
    console.log('Ubicación obtenida:', position.coords);
    
    const { latitude, longitude } = position.coords;
    
    // Guardar coordenadas para futuras actualizaciones
    currentCoordinates = { latitude, longitude };
    isUsingGeolocation = true;
    
    // Obtener datos del clima usando coordenadas
    fetchWeatherByCoordinates(latitude, longitude);
}

/**
 * Manejar error en geolocalización
 * @param {GeolocationPositionError} error - Error de geolocalización
 */
function handleGeolocationError(error) {
    console.error('Error de geolocalización:', error);
    
    hideElement(elements.loadingSpinner);
    
    let errorMessage = 'Error al obtener ubicación';
    
    // Identificar tipo de error
    if (error.code) {
        switch (error.code) {
            case error.PERMISSION_DENIED:
                errorMessage = 'Permiso de ubicación denegado';
                break;
            case error.POSITION_UNAVAILABLE:
                errorMessage = 'Ubicación no disponible';
                break;
            case error.TIMEOUT:
                errorMessage = 'Tiempo de espera agotado';
                break;
        }
    }
    
    // Mostrar búsqueda por ciudad como alternativa
    isUsingGeolocation = false;
    currentCoordinates = null;
    showElement(elements.citySearch);
    console.log('Mostrando búsqueda por ciudad como alternativa');
}

/**
 * Obtener datos del clima usando coordenadas
 * @param {number} lat - Latitud
 * @param {number} lon - Longitud
 */
async function fetchWeatherByCoordinates(lat, lon) {
    try {
        console.log(`Obteniendo clima para coordenadas: ${lat}, ${lon}`);
        
        // Construir URL de la API
        const url = `${API_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=es`;
        
        // Realizar petición a la API
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Datos del clima recibidos:', data);
        
        // Mostrar datos del clima
        displayWeatherData(data);
        
    } catch (error) {
        console.error('Error al obtener datos del clima:', error);
        showError('Error al conectar con el servicio del clima');
    }
}

/**
 * Obtener datos del clima usando nombre de ciudad
 * @param {string} cityName - Nombre de la ciudad
 */
async function fetchWeatherByCity(cityName) {
    try {
        console.log(`Obteniendo clima para ciudad: ${cityName}`);
        
        // Mostrar spinner de carga
        showElement(elements.loadingSpinner);
        hideElement(elements.citySearch);
        hideElement(elements.errorMessage);
        hideElement(elements.weatherCard);
        
        // Construir URL de la API
        const url = `${API_BASE_URL}/weather?q=${encodeURIComponent(cityName)}&appid=${API_KEY}&units=metric&lang=es`;
        
        // Realizar petición a la API
        const response = await fetch(url);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Ciudad no encontrada');
            }
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Datos del clima recibidos:', data);
        
        // Limpiar coordenadas ya que ahora usamos búsqueda por ciudad
        currentCoordinates = null;
        isUsingGeolocation = false;
        
        // Mostrar datos del clima
        displayWeatherData(data);
        
    } catch (error) {
        console.error('Error al obtener datos del clima:', error);
        hideElement(elements.loadingSpinner);
        
        if (error.message === 'Ciudad no encontrada') {
            showElement(elements.citySearch);
            showError('Ciudad no encontrada. Intenta con otro nombre.');
        } else {
            showError('Error al conectar con el servicio del clima');
        }
    }
}

/**
 * Mostrar datos del clima en la interfaz
 * @param {Object} data - Datos del clima de la API
 */
function displayWeatherData(data) {
    console.log('Mostrando datos del clima en la interfaz');
    
    // Guardar datos actuales
    currentWeatherData = data;
    
    // Ocultar elementos de carga y error
    hideElement(elements.loadingSpinner);
    hideElement(elements.citySearch);
    hideElement(elements.errorMessage);
    
    // Actualizar información de ubicación
    document.getElementById('city-name').textContent = data.name;
    document.getElementById('country').textContent = data.sys.country;
    
    // Actualizar temperatura principal con animación
    const tempElement = document.getElementById('temperature');
    tempElement.classList.add('updating');
    setTimeout(() => {
        tempElement.textContent = Math.round(data.main.temp);
        tempElement.classList.remove('updating');
    }, 200);
    
    // Actualizar descripción del clima
    document.getElementById('weather-desc').textContent = data.weather[0].description;
    document.getElementById('feels-like').innerHTML = `Sensación térmica: <span>${Math.round(data.main.feels_like)}°C</span>`;
    
    // Actualizar detalles del clima
    document.getElementById('humidity').textContent = `${data.main.humidity}%`;
    document.getElementById('wind-speed').textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
    document.getElementById('visibility').textContent = `${(data.visibility / 1000).toFixed(1)} km`;
    document.getElementById('pressure').textContent = `${data.main.pressure} hPa`;
    
    // Actualizar icono del clima y fondo
    updateWeatherIcon(data.weather[0].main, data.weather[0].icon);
    updateBackground(data.weather[0].main);
    
    // Mostrar tarjeta del clima
    showElement(elements.weatherCard);
    
    // Habilitar botón de actualizar si estaba deshabilitado
    elements.refreshBtn.disabled = false;
    elements.refreshBtn.classList.remove('refreshing');
}

/**
 * Actualizar icono del clima
 * @param {string} weatherMain - Tipo principal del clima
 * @param {string} weatherIcon - Código del icono de la API
 */
function updateWeatherIcon(weatherMain, weatherIcon) {
    const iconElement = document.getElementById('weather-icon');
    
    // Mapear códigos de clima a iconos de Font Awesome
    const iconMap = {
        'Clear': 'fas fa-sun',
        'Clouds': 'fas fa-cloud',
        'Rain': 'fas fa-cloud-rain',
        'Drizzle': 'fas fa-cloud-drizzle',
        'Thunderstorm': 'fas fa-bolt',
        'Snow': 'fas fa-snowflake',
        'Mist': 'fas fa-smog',
        'Smoke': 'fas fa-smog',
        'Haze': 'fas fa-smog',
        'Dust': 'fas fa-smog',
        'Fog': 'fas fa-smog',
        'Sand': 'fas fa-smog',
        'Ash': 'fas fa-smog',
        'Squall': 'fas fa-wind',
        'Tornado': 'fas fa-wind'
    };
    
    // Aplicar icono correspondiente
    const iconClass = iconMap[weatherMain] || 'fas fa-question';
    iconElement.className = iconClass;
    
    console.log(`Icono actualizado: ${iconClass} para clima: ${weatherMain}`);
}

/**
 * Actualizar fondo de la página según el clima
 * @param {string} weatherMain - Tipo principal del clima
 */
function updateBackground(weatherMain) {
    const body = document.body;
    
    // Limpiar clases de clima previas
    body.classList.remove('sunny', 'rainy', 'cloudy', 'snowy');
    
    // Detener animaciones previas
    stopWeatherAnimations();
    
    // Aplicar clase de fondo según el clima
    switch (weatherMain.toLowerCase()) {
        case 'clear':
            body.classList.add('sunny');
            break;
        case 'rain':
        case 'drizzle':
        case 'thunderstorm':
            body.classList.add('rainy');
            createRainAnimation();
            break;
        case 'clouds':
        case 'mist':
        case 'smoke':
        case 'haze':
        case 'dust':
        case 'fog':
        case 'sand':
        case 'ash':
            body.classList.add('cloudy');
            break;
        case 'snow':
            body.classList.add('snowy');
            createSnowAnimation();
            break;
        default:
            body.classList.add('sunny');
    }
    
    console.log(`Fondo actualizado para clima: ${weatherMain}`);
}

/**
 * Crear animación de lluvia
 */
function createRainAnimation() {
    console.log('Creando animación de lluvia');
    
    showElement(elements.rainParticles);
    
    // Crear gotas de lluvia
    for (let i = 0; i < 100; i++) {
        setTimeout(() => {
            const raindrop = document.createElement('div');
            raindrop.classList.add('raindrop');
            
            // Posición aleatoria
            raindrop.style.left = Math.random() * 100 + '%';
            raindrop.style.animationDuration = (Math.random() * 1 + 0.5) + 's';
            raindrop.style.animationDelay = Math.random() * 2 + 's';
            
            elements.rainParticles.appendChild(raindrop);
            
            // Eliminar gota después de la animación
            setTimeout(() => {
                if (raindrop.parentNode) {
                    raindrop.parentNode.removeChild(raindrop);
                }
            }, 3000);
        }, i * 100);
    }
}

/**
 * Crear animación de nieve
 */
function createSnowAnimation() {
    console.log('Creando animación de nieve');
    
    showElement(elements.snowParticles);
    
    // Crear copos de nieve
    const snowflakes = ['❄', '❅', '❆'];
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const snowflake = document.createElement('div');
            snowflake.classList.add('snowflake');
            snowflake.textContent = snowflakes[Math.floor(Math.random() * snowflakes.length)];
            
            // Posición aleatoria
            snowflake.style.left = Math.random() * 100 + '%';
            snowflake.style.fontSize = (Math.random() * 0.8 + 0.8) + 'rem';
            snowflake.style.animationDuration = (Math.random() * 3 + 2) + 's';
            snowflake.style.animationDelay = Math.random() * 2 + 's';
            
            elements.snowParticles.appendChild(snowflake);
            
            // Eliminar copo después de la animación
            setTimeout(() => {
                if (snowflake.parentNode) {
                    snowflake.parentNode.removeChild(snowflake);
                }
            }, 5000);
        }, i * 200);
    }
}

/**
 * Detener todas las animaciones del clima
 */
function stopWeatherAnimations() {
    console.log('Deteniendo animaciones del clima');
    
    hideElement(elements.rainParticles);
    hideElement(elements.snowParticles);
    
    // Limpiar partículas existentes
    elements.rainParticles.innerHTML = '';
    elements.snowParticles.innerHTML = '';
}

/**
 * Manejar búsqueda por ciudad
 */
function handleCitySearch() {
    const cityName = elements.cityInput.value.trim();
    
    if (cityName === '') {
        showError('Por favor ingresa el nombre de una ciudad');
        return;
    }
    
    console.log(`Buscando clima para ciudad: ${cityName}`);
    fetchWeatherByCity(cityName);
}

/**
 * Refrescar datos del clima - FUNCIÓN ARREGLADA
 */
function refreshWeatherData() {
    console.log('Refrescando datos del clima...');
    
    // Deshabilitar botón y agregar animación
    elements.refreshBtn.disabled = true;
    elements.refreshBtn.classList.add('refreshing');
    
    // Verificar conexión
    if (!navigator.onLine) {
        showError('Sin conexión a internet. Verifica tu conexión.');
        elements.refreshBtn.disabled = false;
        elements.refreshBtn.classList.remove('refreshing');
        return;
    }
    
    // Determinar qué método de actualización usar
    if (isUsingGeolocation && currentCoordinates) {
        // Usar coordenadas guardadas si las tenemos
        console.log('Actualizando con coordenadas guardadas');
        fetchWeatherByCoordinates(currentCoordinates.latitude, currentCoordinates.longitude);
    } else if (currentWeatherData && currentWeatherData.name) {
        // Usar nombre de ciudad si tenemos datos previos
        console.log('Actualizando con nombre de ciudad:', currentWeatherData.name);
        fetchWeatherByCity(currentWeatherData.name);
    } else if (navigator.geolocation) {
        // Intentar obtener ubicación nuevamente
        console.log('Obteniendo nueva ubicación');
        getCurrentLocation();
    } else {
        // Mostrar error si no hay datos para actualizar
        showError('No hay datos para actualizar');
        elements.refreshBtn.disabled = false;
        elements.refreshBtn.classList.remove('refreshing');
    }
}

/**
 * Mostrar mensaje de error
 * @param {string} message - Mensaje de error
 */
function showError(message) {
    console.error('Mostrando error:', message);
    
    document.getElementById('error-text').textContent = message;
    hideElement(elements.loadingSpinner);
    hideElement(elements.weatherCard);
    showElement(elements.errorMessage);
    
    // Habilitar botón de actualizar si estaba deshabilitado
    if (elements.refreshBtn) {
        elements.refreshBtn.disabled = false;
        elements.refreshBtn.classList.remove('refreshing');
    }
}

/**
 * Mostrar elemento (quitar clase hidden)
 * @param {HTMLElement} element - Elemento a mostrar
 */
function showElement(element) {
    if (element) {
        element.classList.remove('hidden');
    }
}

/**
 * Ocultar elemento (agregar clase hidden)
 * @param {HTMLElement} element - Elemento a ocultar
 */
function hideElement(element) {
    if (element) {
        element.classList.add('hidden');
    }
}

/**
 * Verificar conexión a internet
 * @returns {boolean} - True si hay conexión
 */
function isOnline() {
    return navigator.onLine;
}

/**
 * Manejar eventos de conexión
 */
function setupNetworkHandlers() {
    window.addEventListener('online', () => {
        console.log('Conexión restaurada');
        if (currentWeatherData === null) {
            initApp();
        }
    });
    
    window.addEventListener('offline', () => {
        console.log('Conexión perdida');
        showError('Sin conexión a internet. Verifica tu conexión.');
    });
}

/**
 * Función principal que se ejecuta cuando la página carga
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM cargado completamente');
    
    // Configurar manejadores de red
    setupNetworkHandlers();
    
    // Verificar conexión inicial
    if (!isOnline()) {
        showError('Sin conexión a internet. Verifica tu conexión.');
        return;
    }
    
    // Inicializar aplicación
    initApp();
});

// Manejar errores globales de JavaScript
window.addEventListener('error', (event) => {
    console.error('Error global capturado:', event.error);
    showError('Ocurrió un error inesperado. Intenta recargar la página.');
});

// Manejar promesas rechazadas no capturadas
window.addEventListener('unhandledrejection', (event) => {
    console.error('Promesa rechazada no manejada:', event.reason);
    showError('Error de conexión. Verifica tu conexión a internet.');
    event.preventDefault();
});
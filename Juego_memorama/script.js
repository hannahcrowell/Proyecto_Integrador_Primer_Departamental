// ===== CONFIGURACIÓN DEL JUEGO =====
// Array con los emojis que representan las cartas (6 parejas)
const cardSymbols = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊'];

// Tiempo límite en segundos (1 minuto)
const TIME_LIMIT = 60;

// ===== VARIABLES DE ESTADO DEL JUEGO =====
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let attempts = 0;
let gameStarted = false;
let startTime = null;
let timerInterval = null;
let canFlip = true;

// ===== FUNCIONES PRINCIPALES =====

function initGame() {
    console.log('🎮 Inicializando nuevo juego...');
    
    cards = [...cardSymbols, ...cardSymbols];
    shuffleArray(cards);
    createCards();
    resetGameState();
    
    console.log('✅ Juego inicializado correctamente');
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function createCards() {
    const gameBoard = document.getElementById('gameBoard');
    gameBoard.innerHTML = '';

    cards.forEach((symbol, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.setAttribute('data-value', symbol);
        card.setAttribute('data-index', index);
        
        card.innerHTML = `
            <div class="card-face card-front">${symbol}</div>
            <div class="card-face card-back"></div>
        `;
        
        card.addEventListener('click', handleCardClick);
        gameBoard.appendChild(card);
    });
}

function handleCardClick(event) {
    const card = event.currentTarget;
    
    if (!canFlip || 
        card.classList.contains('flipped') || 
        card.classList.contains('matched') ||
        flippedCards.length >= 2) {
        return;
    }

    if (!gameStarted) {
        startGame();
    }

    flipCard(card);
}

function flipCard(card) {
    card.classList.add('flipped');
    flippedCards.push(card);

    if (flippedCards.length === 2) {
        attempts++;
        updateDisplay();
        checkMatch();
    }
}

function checkMatch() {
    const [card1, card2] = flippedCards;
    const value1 = card1.getAttribute('data-value');
    const value2 = card2.getAttribute('data-value');
    
    canFlip = false;

    if (value1 === value2) {
        setTimeout(() => {
            card1.classList.add('matched');
            card2.classList.add('matched');
            matchedPairs++;
            flippedCards = [];
            canFlip = true;
            updateDisplay();
            checkVictory();
        }, 800);
    } else {
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            flippedCards = [];
            canFlip = true;
        }, 1500);
    }
}

function checkVictory() {
    if (matchedPairs === cardSymbols.length) {
        clearInterval(timerInterval);
        setTimeout(() => {
            showVictoryMessage();
        }, 1000);
    }
}

function showVictoryMessage() {
    const victoryMessage = document.getElementById('victoryMessage');
    const victoryStats = document.getElementById('victoryStats');
    const finalTime = document.getElementById('timer').textContent;
    
    const efficiency = Math.max(100 - attempts * 5, 10);
    
    victoryStats.innerHTML = `
        <div style="font-size: 1.3em; margin-bottom: 15px;">🎊 ¡Juego Completado! 🎊</div>
        <div style="margin-bottom: 10px;">⏱️ <strong>Tiempo:</strong> ${finalTime}</div>
        <div style="margin-bottom: 10px;">🎯 <strong>Intentos:</strong> ${attempts}</div>
        <div style="margin-bottom: 10px;">⚡ <strong>Eficiencia:</strong> ${efficiency}%</div>
    `;
    victoryMessage.style.display = 'flex';

    saveScore({ attempts, time: finalTime });
    renderScores();
}

// ===== TEMPORIZADOR =====
function startGame() {
    gameStarted = true;
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    if (!startTime) return;

    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    const remainingTime = TIME_LIMIT - elapsedTime;

    if (remainingTime <= 0) {
        endGameByTimeout();
        return;
    }

    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('timer').textContent = formattedTime;
}

function endGameByTimeout() {
    clearInterval(timerInterval);
    canFlip = false;

    document.querySelectorAll('.card').forEach(card => {
        card.classList.add('flipped');
    });

    const victoryMessage = document.getElementById('victoryMessage');
    const victoryStats = document.getElementById('victoryStats');
    
    victoryStats.innerHTML = `
        <div style="font-size: 1.3em; margin-bottom: 15px;">⏰ ¡Tiempo agotado! ⏰</div>
        <div style="margin-bottom: 10px;">No lograste completar el juego en 1 minuto.</div>
        <div style="margin-bottom: 10px;">🎯 Intentos: ${attempts}</div>
        <div style="margin-bottom: 10px;">🏆 Parejas encontradas: ${matchedPairs}/${cardSymbols.length}</div>
    `;
    victoryMessage.style.display = 'flex';
}

// ===== ACTUALIZAR INTERFAZ =====
function updateDisplay() {
    document.getElementById('attempts').textContent = attempts;
    document.getElementById('pairs').textContent = `${matchedPairs}/${cardSymbols.length}`;
}

function resetGameState() {
    flippedCards = [];
    matchedPairs = 0;
    attempts = 0;
    gameStarted = false;
    startTime = null;
    canFlip = true;
    
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    updateDisplay();
    document.getElementById('timer').textContent = '01:00';
    document.getElementById('victoryMessage').style.display = 'none';
}

function resetGame() {
    resetGameState();
    initGame();
}

// ===== HISTORIAL DE SCORES =====
function saveScore(result) {
    let scores = JSON.parse(localStorage.getItem("memoryScores")) || [];
    scores.push(result);
    localStorage.setItem("memoryScores", JSON.stringify(scores));
}

function renderScores() {
    let scores = JSON.parse(localStorage.getItem("memoryScores")) || [];
    const scoreList = document.getElementById("scoreList");
    if (!scoreList) return;
    scoreList.innerHTML = "";
    scores.forEach((score, index) => {
        let li = document.createElement("li");
        li.textContent = `Partida ${index + 1}: ${score.attempts} intentos - ${score.time}`;
        scoreList.appendChild(li);
    });
}

function clearScores() {
    localStorage.removeItem("memoryScores");
    renderScores();
}

// ===== EVENTOS =====
document.addEventListener('DOMContentLoaded', function() {
    initGame();
    renderScores();
});

document.addEventListener('selectstart', function(e) {
    if (e.target.closest('.card')) {
        e.preventDefault();
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const victoryMessage = document.getElementById('victoryMessage');
        if (victoryMessage.style.display === 'flex') {
            resetGame();
        }
    }
});

console.log('🎮 Script del Juego de Memoria cargado correctamente');

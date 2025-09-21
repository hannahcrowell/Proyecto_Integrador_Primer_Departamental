const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const levelEl = document.getElementById("level");
const bestScoreEl = document.getElementById("bestScore");
const finalScoreEl = document.getElementById("finalScore");
const playerNameEl = document.getElementById("playerName");

const startBtn = document.getElementById("startBtn");
const leaderboardBtn = document.getElementById("leaderboardBtn");
const restartBtn = document.getElementById("restartBtn");
const saveScoreBtn = document.getElementById("saveScoreBtn");
const closeLeaderboardBtn = document.getElementById("closeLeaderboardBtn");

const gameOverModal = document.getElementById("gameOverModal");
const leaderboardModal = document.getElementById("leaderboardModal");
const leaderboardList = document.getElementById("leaderboardList");

let player, obstacles, clouds, particles, score, level, bestScore, gameSpeed, gravity, interval, isRunning;
let timeToNextObstacle;

// Constantes para el tamaño del suelo y el jugador (para facilitar ajustes)
const groundHeight = 30;
const playerSize = 45;

// Obtener un intervalo aleatorio para los obstáculos
function getRandomInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Inicialización del juego
function initGame() {
  player = {
    x: 50,
    y: canvas.height - groundHeight - playerSize,
    width: playerSize,
    height: playerSize,
    dy: 0,
    jumpPower: -12.5,
    grounded: true
  };
  obstacles = [];
  clouds = [];
  particles = [];
  score = 0;
  level = 1;
  gameSpeed = 5;
  gravity = 0.55;
  isRunning = true;
  interval = 0;
  timeToNextObstacle = getRandomInterval(80, 150);

  bestScore = localStorage.getItem("bestScore") || 0;
  bestScoreEl.textContent = bestScore;
  
  // Ocultamos el botón de inicio cuando el juego arranca
  startBtn.style.display = 'none';

  requestAnimationFrame(update);
}

// Dibujar jugador (emoji dino 🦖)
function drawPlayer() {
  ctx.font = `${playerSize}px Arial`;
  ctx.save();
  ctx.scale(-1, 1);
  ctx.fillText("🦖", -player.x - player.width + 5, player.y + player.height - 5);
  ctx.restore();
}

// Dibujar obstáculos
function drawObstacles() {
  const obstacleEmojiSize = 60;
  ctx.font = `${obstacleEmojiSize}px Arial`;
  obstacles.forEach(obs => {
    ctx.fillText("🚧", obs.x, obs.y + obs.height - 5);
  });
}

// Dibujar nubes
function drawClouds() {
  ctx.fillStyle = "#fff";
  clouds.forEach(cloud => {
    ctx.beginPath();
    ctx.arc(cloud.x, cloud.y, 25, 0, Math.PI * 2);
    ctx.arc(cloud.x + 30, cloud.y, 25, 0, Math.PI * 2);
    ctx.arc(cloud.x + 15, cloud.y - 20, 25, 0, Math.PI * 2);
    ctx.fill();
  });
}

// Dibujar partículas de polvo
function drawParticles() {
  ctx.fillStyle = "#ccc";
  particles.forEach((p, i) => {
    ctx.globalAlpha = p.alpha;
    ctx.fillRect(p.x, p.y, p.size, p.size);
    ctx.globalAlpha = 1;

    p.x -= p.speed;
    p.alpha -= 0.02;
    if (p.alpha <= 0) particles.splice(i, 1);
  });
}

// Actualizar juego
function update() {
  if (!isRunning) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Gravedad
  player.dy += gravity;
  player.y += player.dy;
  if (player.y + player.height >= canvas.height - groundHeight) {
    player.y = canvas.height - groundHeight - player.height;
    player.dy = 0;
    player.grounded = true;

    // Generar polvo
    if (Math.random() < 0.3) {
      particles.push({
        x: player.x,
        y: player.y + player.height - 5,
        size: 4,
        speed: 2,
        alpha: 1
      });
    }
  }

  // Dibujar jugador
  drawPlayer();

  // Obstáculos
  timeToNextObstacle--;
  if (timeToNextObstacle <= 0) {
    const minObstacleHeight = 60;
    const maxObstacleHeight = 90;
    const obstacleHeight = Math.floor(Math.random() * (maxObstacleHeight - minObstacleHeight + 1)) + minObstacleHeight;

    obstacles.push({
      x: canvas.width,
      y: canvas.height - groundHeight - obstacleHeight,
      width: 30 + Math.random() * 30,
      height: obstacleHeight
    });
    timeToNextObstacle = getRandomInterval(80, 150);
  }
  obstacles.forEach((obs, i) => {
    obs.x -= gameSpeed;

    // Colisión
    if (
      player.x < obs.x + obs.width &&
      player.x + player.width > obs.x &&
      player.y < obs.y + obs.height &&
      player.y + player.height > obs.y
    ) {
      endGame();
    }

    if (obs.x + obs.width < 0) {
      obstacles.splice(i, 1);
      score++;
      if (score % 10 === 0) {
        level++;
        gameSpeed++;
      }
    }
  });

  drawObstacles();

  // Nubes
  if (interval % 150 === 0) {
    clouds.push({
      x: canvas.width,
      y: 30 + Math.random() * 70
    });
  }
  clouds.forEach((cloud, i) => {
    cloud.x -= 2;
    if (cloud.x + 60 < 0) clouds.splice(i, 1);
  });

  drawClouds();

  // Dibujar partículas
  drawParticles();

  // Suelo
  ctx.fillStyle = "#444";
  ctx.fillRect(0, canvas.height - groundHeight, canvas.width, groundHeight);

  // UI
  scoreEl.textContent = score;
  levelEl.textContent = level;

  interval++;
  requestAnimationFrame(update);
}

// Saltar
document.addEventListener("keydown", e => {
  if ((e.code === "Space" || e.code === "ArrowUp") && player.grounded) {
    player.dy = player.jumpPower;
    player.grounded = false;
  }
});

// Fin del juego
function endGame() {
  isRunning = false;
  finalScoreEl.textContent = score;
  gameOverModal.style.display = "flex";

  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("bestScore", bestScore);
  }
}

// Guardar puntuación - MODIFICADO PARA USAR API
function saveScore() {
  const name = playerNameEl.value.trim() || "Anónimo";
  
  // NUEVO: Usar la API para guardar en el servidor
  scoreAPI.saveScore(name, score, level)
    .then(result => {
      if (result.success) {
        const message = result.isLocal 
          ? '💾 Puntuación guardada localmente (servidor no disponible)'
          : '✅ ¡Puntuación guardada en el servidor!';
        alert(message);
        
        // Actualizar el leaderboard después de guardar
        renderLeaderboard();
      } else {
        alert('❌ Error guardando la puntuación');
        console.error('Error:', result.error);
      }
      
      // Limpiar y cerrar modal
      playerNameEl.value = "";
      gameOverModal.style.display = "none";
    })
    .catch(error => {
      console.error('Error:', error);
      alert('❌ Error guardando la puntuación');
    });
}

// Render leaderboard - MODIFICADO PARA USAR API
function renderLeaderboard() {
  leaderboardList.innerHTML = '<li>🏆 Cargando puntuaciones...</li>';
  
  // NUEVO: Usar la API para obtener puntuaciones del servidor
  scoreAPI.getScores()
    .then(result => {
      leaderboardList.innerHTML = "";
      
      if (result.success && result.scores.length > 0) {
        // Mostrar indicador si es offline/local
        if (result.isLocal) {
          const offlineNote = document.createElement("li");
          offlineNote.style.color = "#orange";
          offlineNote.style.fontStyle = "italic";
          offlineNote.textContent = "⚠️ Modo offline - Puntuaciones locales";
          leaderboardList.appendChild(offlineNote);
        }
        
        // Mostrar las puntuaciones
        result.scores.slice(0, 10).forEach((s, index) => {
          const li = document.createElement("li");
          const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
          const localBadge = s.isLocal ? ' 💾' : '';
          li.textContent = `${medal} ${s.playerName}${localBadge}: ${s.score} pts (Nivel ${s.level})`;
          leaderboardList.appendChild(li);
        });
      } else {
        const li = document.createElement("li");
        li.textContent = "🎯 ¡Sé el primero en jugar!";
        leaderboardList.appendChild(li);
      }
    })
    .catch(error => {
      console.error('Error cargando leaderboard:', error);
      leaderboardList.innerHTML = '<li>❌ Error cargando puntuaciones</li>';
    });
}

// Eventos
startBtn.addEventListener("click", initGame);
restartBtn.addEventListener("click", () => {
  gameOverModal.style.display = "none";
  initGame();
});
saveScoreBtn.addEventListener("click", saveScore);
leaderboardBtn.addEventListener("click", () => {
  renderLeaderboard();
  leaderboardModal.style.display = "flex";
});
closeLeaderboardBtn.addEventListener("click", () => {
  leaderboardModal.style.display = "none";
});
// api.js - Manejo de puntuaciones y conexión con el backend

class ScoreAPI {
    constructor() {
        // URL del backend - cambiar cuando subas a producción
        this.baseURL = 'https://proyectbackend-qdg2.onrender.com/api/scores';
        this.isServerAvailable = true;
    }

    // Guardar puntuación en el servidor
    async saveScore(playerName, score, level) {
        try {
            console.log(`Intentando guardar: ${playerName} - ${score} puntos (Nivel ${level})`);
            
            const response = await fetch(this.baseURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    playerName: playerName,
                    score: score,
                    level: level
                })
            });

            if (!response.ok) {
                throw new Error(`Error del servidor: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.success) {
                console.log('✅ Puntuación guardada en el servidor');
                this.isServerAvailable = true;
                return { success: true, data: data.data };
            } else {
                throw new Error(data.error || 'Error desconocido');
            }

        } catch (error) {
            console.warn('⚠️ Error conectando con servidor:', error.message);
            console.log('💾 Guardando en localStorage como respaldo...');
            
            // Si falla el servidor, guardar en localStorage
            this.isServerAvailable = false;
            return this.saveScoreLocally(playerName, score, level);
        }
    }

    // Guardar en localStorage como respaldo
    saveScoreLocally(playerName, score, level) {
        try {
            const localScores = this.getLocalScores();
            
            const newScore = {
                id: Date.now().toString(),
                playerName: playerName.trim().substring(0, 20),
                score: Math.max(0, Math.floor(score)),
                level: Math.max(1, Math.floor(level)),
                date: new Date().toISOString(),
                timestamp: Date.now(),
                isLocal: true // Marcar como guardado localmente
            };
            
            localScores.push(newScore);
            
            // Mantener solo los mejores 50 para no llenar el localStorage
            const topScores = localScores
                .sort((a, b) => b.score - a.score)
                .slice(0, 50);
            
            localStorage.setItem('dinoGameScores', JSON.stringify(topScores));
            
            console.log('✅ Puntuación guardada localmente');
            return { success: true, data: newScore, isLocal: true };
            
        } catch (error) {
            console.error('❌ Error guardando localmente:', error);
            return { success: false, error: error.message };
        }
    }

    // Obtener puntuaciones del servidor
    async getScores() {
        try {
            const response = await fetch(this.baseURL);
            
            if (!response.ok) {
                throw new Error(`Error del servidor: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                this.isServerAvailable = true;
                return { success: true, scores: data.data, isLocal: false };
            } else {
                throw new Error(data.error || 'Error desconocido');
            }
            
        } catch (error) {
            console.warn('⚠️ Error obteniendo puntuaciones del servidor:', error.message);
            console.log('💾 Obteniendo puntuaciones locales...');
            
            // Si falla el servidor, usar localStorage
            this.isServerAvailable = false;
            const localScores = this.getLocalScores()
                .sort((a, b) => b.score - a.score)
                .slice(0, 10);
            
            return { success: true, scores: localScores, isLocal: true };
        }
    }

    // Obtener puntuaciones del localStorage
    getLocalScores() {
        try {
            const stored = localStorage.getItem('dinoGameScores');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error leyendo localStorage:', error);
            return [];
        }
    }

    // Mostrar el leaderboard en pantalla
    async displayLeaderboard(containerId = 'leaderboard') {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`No se encontró el elemento con ID: ${containerId}`);
            return;
        }

        // Mostrar loading
        container.innerHTML = '<div class="loading">🏆 Cargando puntuaciones...</div>';

        const result = await this.getScores();
        
        if (!result.success || result.scores.length === 0) {
            container.innerHTML = '<div class="no-scores">🎯 ¡Sé el primero en jugar!</div>';
            return;
        }

        // Crear tabla de puntuaciones
        let html = `
            <div class="leaderboard-header">
                <h3>🏆 Mejores Puntuaciones</h3>
                ${result.isLocal ? '<small>⚠️ Modo offline - Puntuaciones locales</small>' : '<small>🌐 Conectado al servidor</small>'}
            </div>
            <div class="scores-list">
        `;

        result.scores.forEach((score, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
            const date = new Date(score.date).toLocaleDateString();
            const isLocalBadge = score.isLocal ? ' 💾' : '';
            
            html += `
                <div class="score-row ${index < 3 ? 'top-three' : ''}">
                    <span class="position">${medal}</span>
                    <span class="name">${score.playerName}${isLocalBadge}</span>
                    <span class="score">${score.score.toLocaleString()}</span>
                    <span class="level">Nivel ${score.level}</span>
                    <span class="date">${date}</span>
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;
    }

    // Función helper para mostrar formulario de guardar puntuación
    showSaveScoreForm(currentScore, currentLevel, onSave) {
        const playerName = prompt(`🎉 ¡Nueva puntuación: ${currentScore} puntos!\n🏆 Nivel alcanzado: ${currentLevel}\n\n¿Cuál es tu nombre?`);
        
        if (playerName && playerName.trim()) {
            this.saveScore(playerName.trim(), currentScore, currentLevel)
                .then(result => {
                    if (result.success) {
                        const message = result.isLocal 
                            ? '💾 Puntuación guardada localmente (servidor no disponible)'
                            : '✅ ¡Puntuación guardada exitosamente!';
                        alert(message);
                        if (onSave) onSave(result);
                    } else {
                        alert('❌ Error guardando la puntuación: ' + (result.error || 'Error desconocido'));
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('❌ Error guardando la puntuación');
                });
        }
    }

    // Verificar si el servidor está disponible
    async checkServerStatus() {
        try {
            const response = await fetch(this.baseURL, { 
                method: 'GET',
                timeout: 5000 // 5 segundos
            });
            this.isServerAvailable = response.ok;
            return this.isServerAvailable;
        } catch (error) {
            this.isServerAvailable = false;
            return false;
        }
    }
}

// Crear instancia global
const scoreAPI = new ScoreAPI();

// Ejemplo de uso (puedes usar esto en tu juego):
/*
// Al final del juego:
scoreAPI.showSaveScoreForm(finalScore, currentLevel, (result) => {
    // Actualizar leaderboard después de guardar
    scoreAPI.displayLeaderboard();
});

// Para mostrar el leaderboard:
scoreAPI.displayLeaderboard('leaderboard-container');
*/
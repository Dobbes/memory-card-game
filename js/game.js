/**
 * Memory Card Game - Complete JavaScript
 * 90's Capcom Street Fighter Arcade Style
 */

// Memory Card Game - Utility Functions
const STORAGE_KEY = 'memoryGameHistory';

function getGameHistory() {
    try {
        const history = localStorage.getItem(STORAGE_KEY);
        return history ? JSON.parse(history) : [];
    } catch (error) {
        console.error('Error reading game history:', error);
        return [];
    }
}

function saveGameHistory(history) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
        console.error('Error saving game history:', error);
    }
}

function clearGameHistory() {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error('Error clearing game history:', error);
    }
}

function calculateStats(history) {
    if (!history || history.length === 0) {
        return {
            totalGames: 0,
            averageFlips: 0,
            totalFlips: 0
        };
    }
    
    const totalGames = history.length;
    const totalFlips = history.reduce((sum, game) => sum + game.flips, 0);
    
    return {
        totalGames,
        averageFlips: Math.round(totalFlips / totalGames),
        totalFlips
    };
}

// Memory Card Game - Main Game Logic
class MemoryGame {
    constructor() {
        this.boardWidth = 4;
        this.boardHeight = 5;
        this.isLandscape = false;
        this.cards = [];
        this.flippedCards = [];
        this.revealedPairs = new Set();
        this.seenCardPositions = new Set();
        this.matchedPairs = 0;
        this.flips = 0;
        this.misses = 0;
        this.gameActive = false; // Start disabled until intro finishes
        
        this.suits = ['♠', '♥', '♦', '♣'];
        this.values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        this.suitClasses = ['suit-spade', 'suit-heart', 'suit-diamond', 'suit-club'];
        
        this.checkOrientation();
    }
    
    showIntroSequence() {
        const messages = ['LEVEL 1', 'FIND MATCHING CARDS', 'GO!'];
        let currentMessage = 0;
        
        // Create intro overlay
        const overlay = document.createElement('div');
        overlay.className = 'intro-overlay';
        overlay.textContent = messages[currentMessage];
        document.body.appendChild(overlay);
        
        // Disable game interaction
        this.gameActive = false;
        
        const showNextMessage = () => {
            currentMessage++;
            if (currentMessage < messages.length) {
                // Fade out current message
                overlay.classList.add('fadeout');
                
                setTimeout(() => {
                    // Show next message
                    overlay.classList.remove('fadeout');
                    overlay.textContent = messages[currentMessage];
                    setTimeout(showNextMessage, 1200); // Show each message for 1.2 seconds
                }, 500);
            } else {
                // Final fade out and start game
                overlay.classList.add('fadeout');
                setTimeout(() => {
                    document.body.removeChild(overlay);
                    // Enable game interaction and start actual game
                    this.gameActive = true;
                    this.reset();
                }, 500);
            }
        };
        
        // Start the sequence
        setTimeout(showNextMessage, 1200);
    }
    
    checkOrientation() {
        const aspectRatio = window.innerWidth / window.innerHeight;
        this.isLandscape = aspectRatio > 1.2;
        
        if (this.isLandscape) {
            this.boardWidth = 5;
            this.boardHeight = 4;
        } else {
            this.boardWidth = 4;
            this.boardHeight = 5;
        }
    }
    
    initializeGame() {
        this.checkOrientation();
        this.createCardPairs();
        this.shuffleCards();
        this.renderBoard();
        this.updateStats();
        this.clearRevealedCards();
    }
    
    createCardPairs() {
        this.cards = [];
        const totalCards = this.boardWidth * this.boardHeight;
        const pairsNeeded = totalCards / 2;
        
        for (let i = 0; i < pairsNeeded; i++) {
            const suit = this.suits[i % this.suits.length];
            const value = this.values[Math.floor(i / this.suits.length) % this.values.length];
            const suitClass = this.suitClasses[i % this.suitClasses.length];
            
            const cardData = {
                id: i,
                suit: suit,
                value: value,
                suitClass: suitClass,
                isFlipped: false,
                isMatched: false
            };
            
            this.cards.push({...cardData, uniqueId: i * 2});
            this.cards.push({...cardData, uniqueId: i * 2 + 1});
        }
    }
    
    shuffleCards() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }
    
    renderBoard() {
        const board = document.getElementById('gameBoard');
        board.innerHTML = '';
        
        if (this.isLandscape) {
            board.className = 'game-board landscape';
        } else {
            board.className = 'game-board portrait';
        }
        
        this.cards.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card back';
            cardElement.dataset.index = index;
            cardElement.addEventListener('click', () => this.flipCard(index));
            board.appendChild(cardElement);
        });
    }
    
    clearRevealedCards() {
        this.revealedPairs.clear();
        this.seenCardPositions.clear();
        document.getElementById('revealedCards').innerHTML = '';
    }
    
    flipCard(index) {
        if (!this.gameActive) return;
        
        const card = this.cards[index];
        const cardElement = document.querySelector(`[data-index="${index}"]`);
        
        if (card.isFlipped || card.isMatched) return;
        if (this.flippedCards.length >= 2) return;
        
        this.seenCardPositions.add(index);
        this.checkForNewRevealedPair(card);
        
        card.isFlipped = true;
        this.flippedCards.push(index);
        this.flips++;
        
        cardElement.className = `card flipped ${card.suitClass}`;
        cardElement.innerHTML = `${card.value}${card.suit}`;
        
        if (this.flippedCards.length === 2) {
            setTimeout(() => this.checkMatch(), 1000);
        }
        
        this.updateStats();
    }
    
    checkForNewRevealedPair(card) {
        const pairId = card.id;
        
        if (this.revealedPairs.has(pairId)) return;
        
        const positionsOfThisPair = [];
        this.cards.forEach((c, index) => {
            if (c.id === pairId) {
                positionsOfThisPair.push(index);
            }
        });
        
        const allPositionsFlipped = positionsOfThisPair.every(pos => 
            this.seenCardPositions.has(pos)
        );
        
        if (allPositionsFlipped) {
            this.revealedPairs.add(pairId);
            
            const revealedContainer = document.getElementById('revealedCards');
            const revealedElement = document.createElement('div');
            revealedElement.className = `revealed-card ${card.suitClass}`;
            revealedElement.innerHTML = `${card.value}${card.suit}`;
            revealedContainer.appendChild(revealedElement);
        }
    }
    
    checkMatch() {
        const [firstIndex, secondIndex] = this.flippedCards;
        const firstCard = this.cards[firstIndex];
        const secondCard = this.cards[secondIndex];
        const firstElement = document.querySelector(`[data-index="${firstIndex}"]`);
        const secondElement = document.querySelector(`[data-index="${secondIndex}"]`);
        
        if (firstCard.id === secondCard.id) {
            firstCard.isMatched = true;
            secondCard.isMatched = true;
            firstElement.className += ' matched';
            secondElement.className += ' matched';
            
            this.matchedPairs++;
            
            if (this.matchedPairs === (this.boardWidth * this.boardHeight) / 2) {
                setTimeout(() => this.gameComplete(), 2000);
            }
        } else {
            const pairId = firstCard.id;
            
            if (this.revealedPairs.has(pairId)) {
                this.misses++;
            }
            
            firstCard.isFlipped = false;
            secondCard.isFlipped = false;
            firstElement.className = 'card back';
            firstElement.innerHTML = '';
            secondElement.className = 'card back';
            secondElement.innerHTML = '';
        }
        
        this.flippedCards = [];
        this.updateStats();
    }
    
    updateStats() {
        document.getElementById('flips').textContent = this.flips;
        document.getElementById('misses').textContent = this.misses;
    }
    
    gameComplete() {
        this.gameActive = false;
        
        // Start fireworks animation
        this.startFireworks();
        
        this.saveToHistory();
        
        // Show completion modal after shorter delay
        setTimeout(() => {
            document.getElementById('finalStats').innerHTML = `
                <div><strong>Total Flips:</strong> ${this.flips}</div>
                <div><strong>Missed Matches:</strong> ${this.misses}</div>
            `;
            
            document.getElementById('gameOver').style.display = 'flex';
        }, 2000); // Reduced to 2 seconds so you can interact sooner
    }
    
    startFireworks() {
        const fireworksContainer = document.createElement('div');
        fireworksContainer.className = 'fireworks';
        document.body.appendChild(fireworksContainer);
        
        // Arcade-style colors: blue, red, white, green
        const colors = ['#00a2ff', '#ff5757', '#ffffff', '#4CAF50', '#ff9800', '#9c27b0', '#00bcd4', '#ffeb3b'];
        
        // WAY MORE FIREWORKS! 30 bursts over 6 seconds
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                this.createFirework(fireworksContainer, colors);
            }, i * 200);
        }
        
        // Remove fireworks container after longer animation
        setTimeout(() => {
            if (document.body.contains(fireworksContainer)) {
                document.body.removeChild(fireworksContainer);
            }
        }, 6000);
    }
    
    createFirework(container, colors) {
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight * 0.7; // Slightly lower for better coverage
        
        // Create BIGGER firework burst with more particles
        for (let i = 0; i < 20; i++) { // Increased from 12 to 20 particles per burst
            const firework = document.createElement('div');
            firework.className = 'firework';
            firework.style.left = x + 'px';
            firework.style.top = y + 'px';
            firework.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            
            // Random direction for explosion
            const angle = (i / 20) * 2 * Math.PI + (Math.random() - 0.5) * 0.5; // Add some randomness
            const distance = 60 + Math.random() * 120; // Bigger explosions
            const finalX = x + Math.cos(angle) * distance;
            const finalY = y + Math.sin(angle) * distance;
            
            firework.style.setProperty('--final-x', (finalX - x) + 'px');
            firework.style.setProperty('--final-y', (finalY - y) + 'px');
            
            container.appendChild(firework);
            
            // Create MORE sparks per firework
            setTimeout(() => {
                for (let j = 0; j < 10; j++) { // Increased from 6 to 10 sparks
                    const spark = document.createElement('div');
                    spark.className = 'spark';
                    spark.style.left = finalX + 'px';
                    spark.style.top = finalY + 'px';
                    spark.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                    
                    const sparkAngle = Math.random() * 2 * Math.PI;
                    const sparkDistance = 20 + Math.random() * 60; // Longer spark trails
                    const sparkX = finalX + Math.cos(sparkAngle) * sparkDistance;
                    const sparkY = finalY + Math.sin(sparkAngle) * sparkDistance;
                    
                    spark.style.setProperty('--spark-x', (sparkX - finalX) + 'px');
                    spark.style.setProperty('--spark-y', (sparkY - finalY) + 'px');
                    
                    container.appendChild(spark);
                    
                    setTimeout(() => {
                        if (spark.parentNode) {
                            spark.parentNode.removeChild(spark);
                        }
                    }, 2500); // Longer spark duration
                }
            }, 800);
            
            setTimeout(() => {
                if (firework.parentNode) {
                    firework.parentNode.removeChild(firework);
                }
            }, 5000); // Longer firework duration
        }
    }
    
    saveToHistory() {
        const gameData = {
            date: new Date().toLocaleDateString(),
            cards: this.boardWidth * this.boardHeight,
            flips: this.flips,
            timestamp: Date.now()
        };
        
        let history = getGameHistory();
        history.unshift(gameData);
        
        if (history.length > 50) {
            history = history.slice(0, 50);
        }
        
        saveGameHistory(history);
    }
    
    reset() {
        this.matchedPairs = 0;
        this.flips = 0;
        this.misses = 0;
        this.flippedCards = [];
        this.gameActive = true;
        this.initializeGame();
    }
}

// Memory Card Game - UI Management
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    document.getElementById(screenId).classList.add('active');
    
    if (screenId === 'historyScreen') {
        loadHistory();
    }
}

function startNewGame() {
    showScreen('gameScreen');
    if (game) {
        // Show intro sequence before starting game
        game.showIntroSequence();
    }
}

function closeGameOver() {
    document.getElementById('gameOver').style.display = 'none';
}

function exitGame() {
    if (confirm('Are you sure you want to exit the battle?')) {
        alert('Thanks for playing! Close this tab to exit.');
    }
}

function loadHistory() {
    const history = getGameHistory();
    const historyList = document.getElementById('historyList');
    
    if (history.length === 0) {
        historyList.innerHTML = '<div class="no-history">No battles fought yet. Start your first battle to see your history!</div>';
        return;
    }
    
    historyList.innerHTML = history.map(gameData => `
        <div class="history-item">
            <div class="history-date">${gameData.date}</div>
            <div class="history-stats">
                <div class="history-stat">Cards: ${gameData.cards}</div>
                <div class="history-stat">Flips: ${gameData.flips}</div>
            </div>
        </div>
    `).join('');
}

function clearHistory() {
    if (confirm('Are you sure you want to clear your battle history?')) {
        clearGameHistory();
        loadHistory();
    }
}

// Global game instance
let game;

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', function() {
    game = new MemoryGame();
});

// Handle window resize for responsive layout
window.addEventListener('resize', function() {
    if (game && game.gameActive) {
        const wasLandscape = game.isLandscape;
        game.checkOrientation();
        
        if (wasLandscape !== game.isLandscape) {
            game.reset();
        } else {
            game.renderBoard();
        }
    }
});

// Handle keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const gameOver = document.getElementById('gameOver');
        if (gameOver.style.display === 'flex') {
            closeGameOver();
        } else {
            const currentScreen = document.querySelector('.screen.active');
            if (currentScreen && currentScreen.id !== 'mainMenu') {
                showScreen('mainMenu');
            }
        }
    }
    
    if (e.key === 'Enter') {
        const currentScreen = document.querySelector('.screen.active');
        if (currentScreen && currentScreen.id === 'mainMenu') {
            startNewGame();
        }
    }
    
    if (e.key.toLowerCase() === 'n') {
        const currentScreen = document.querySelector('.screen.active');
        if (currentScreen && currentScreen.id === 'gameScreen') {
            startNewGame();
        }
    }
});

// Touch support for mobile devices
document.addEventListener('touchstart', function() {}, true);

// Prevent context menu on long press for mobile
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});
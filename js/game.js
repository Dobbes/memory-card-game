/**
 * Memory Card Game - Main Game Logic
 * Handles game state, card management, and game mechanics
 */

class MemoryGame {
    constructor() {
        this.boardWidth = 4;
        this.boardHeight = 5;
        this.isLandscape = false;
        this.cards = [];
        this.flippedCards = [];
        this.revealedPairs = new Set(); // Track pairs where both cards have been seen
        this.seenCardPositions = new Set(); // Track card positions that have been flipped
        this.matchedPairs = 0;
        this.flips = 0;
        this.misses = 0;
        this.gameActive = true;
        
        // Card deck setup
        this.suits = ['♠', '♥', '♦', '♣'];
        this.values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        this.suitClasses = ['suit-spade', 'suit-heart', 'suit-diamond', 'suit-club'];
        
        this.checkOrientation();
    }
    
    /**
     * Check screen orientation and adjust board dimensions
     */
    checkOrientation() {
        const aspectRatio = window.innerWidth / window.innerHeight;
        this.isLandscape = aspectRatio > 1.2; // More horizontal than vertical
        
        if (this.isLandscape) {
            this.boardWidth = 5;
            this.boardHeight = 4;
        } else {
            this.boardWidth = 4;
            this.boardHeight = 5;
        }
    }
    
    /**
     * Initialize the game
     */
    initializeGame() {
        this.checkOrientation();
        this.createCardPairs();
        this.shuffleCards();
        this.renderBoard();
        this.updateStats();
        this.clearRevealedCards();
    }
    
    /**
     * Create pairs of cards for the game
     */
    createCardPairs() {
        this.cards = [];
        const totalCards = this.boardWidth * this.boardHeight;
        const pairsNeeded = totalCards / 2;
        
        // Create pairs of cards
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
            
            // Add two identical cards (a pair)
            this.cards.push({...cardData, uniqueId: i * 2});
            this.cards.push({...cardData, uniqueId: i * 2 + 1});
        }
    }
    
    /**
     * Shuffle the cards array using Fisher-Yates algorithm
     */
    shuffleCards() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }
    
    /**
     * Render the game board with cards
     */
    renderBoard() {
        const board = document.getElementById('gameBoard');
        board.innerHTML = '';
        
        // Set grid layout based on orientation
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
    
    /**
     * Clear revealed cards display
     */
    clearRevealedCards() {
        this.revealedPairs.clear();
        this.seenCardPositions.clear();
        document.getElementById('revealedCards').innerHTML = '';
    }
    
    /**
     * Flip a card at the given index
     * @param {number} index - The index of the card to flip
     */
    flipCard(index) {
        if (!this.gameActive) return;
        
        const card = this.cards[index];
        const cardElement = document.querySelector(`[data-index="${index}"]`);
        
        // Can't flip if already flipped or matched
        if (card.isFlipped || card.isMatched) return;
        
        // Can't flip more than 2 cards at once
        if (this.flippedCards.length >= 2) return;
        
        // Track that this position has been flipped
        this.seenCardPositions.add(index);
        
        // Check if this completes a revealed pair
        this.checkForNewRevealedPair(card);
        
        // Flip the card
        card.isFlipped = true;
        this.flippedCards.push(index);
        this.flips++;
        
        // Show the card face
        cardElement.className = `card flipped ${card.suitClass}`;
        cardElement.innerHTML = `${card.value}${card.suit}`;
        
        // Check for match if two cards are flipped
        if (this.flippedCards.length === 2) {
            setTimeout(() => this.checkMatch(), 1000);
        }
        
        this.updateStats();
    }
    
    /**
     * Check if a new pair has been fully revealed
     * @param {Object} card - The card that was just flipped
     */
    checkForNewRevealedPair(card) {
        const pairId = card.id;
        
        // If this pair is already revealed, don't check again
        if (this.revealedPairs.has(pairId)) return;
        
        // Find all positions of cards with this pair ID
        const positionsOfThisPair = [];
        this.cards.forEach((c, index) => {
            if (c.id === pairId) {
                positionsOfThisPair.push(index);
            }
        });
        
        // Check if ALL positions of this pair have been seen
        const allPositionsFlipped = positionsOfThisPair.every(pos => 
            this.seenCardPositions.has(pos)
        );
        
        // If both positions of this pair have been flipped, add to revealed pairs
        if (allPositionsFlipped) {
            this.revealedPairs.add(pairId);
            
            const revealedContainer = document.getElementById('revealedCards');
            const revealedElement = document.createElement('div');
            revealedElement.className = `revealed-card ${card.suitClass}`;
            revealedElement.innerHTML = `${card.value}${card.suit}`;
            revealedContainer.appendChild(revealedElement);
        }
    }
    
    /**
     * Check if the two flipped cards match
     */
    checkMatch() {
        const [firstIndex, secondIndex] = this.flippedCards;
        const firstCard = this.cards[firstIndex];
        const secondCard = this.cards[secondIndex];
        const firstElement = document.querySelector(`[data-index="${firstIndex}"]`);
        const secondElement = document.querySelector(`[data-index="${secondIndex}"]`);
        
        if (firstCard.id === secondCard.id) {
            // Match found!
            firstCard.isMatched = true;
            secondCard.isMatched = true;
            firstElement.className += ' matched';
            secondElement.className += ' matched';
            
            this.matchedPairs++;
            
            // Check if game is complete
            if (this.matchedPairs === (this.boardWidth * this.boardHeight) / 2) {
                setTimeout(() => this.gameComplete(), 2000); // Wait for animation
            }
        } else {
            // No match - check if this should count as a miss
            // Only count as miss if this pair was ALREADY revealed before this attempt
            const pairId = firstCard.id;
            
            // Check if pair was already in revealed pairs before this flip attempt
            if (this.revealedPairs.has(pairId)) {
                this.misses++;
            }
            
            // Flip cards back
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
    
    /**
     * Update the statistics display
     */
    updateStats() {
        const efficiency = this.flips > 0 ? Math.round((this.matchedPairs * 2 / this.flips) * 100) : 100;
        
        document.getElementById('flips').textContent = this.flips;
        document.getElementById('misses').textContent = this.misses;
        document.getElementById('efficiency').textContent = efficiency + '%';
    }
    
    /**
     * Handle game completion
     */
    gameComplete() {
        this.gameActive = false;
        const efficiency = Math.round((this.matchedPairs * 2 / this.flips) * 100);
        
        // Save to history
        this.saveToHistory(efficiency);
        
        document.getElementById('finalStats').innerHTML = `
            <div><strong>Total Flips:</strong> ${this.flips}</div>
            <div><strong>Missed Matches:</strong> ${this.misses}</div>
            <div><strong>Efficiency:</strong> ${efficiency}%</div>
        `;
        
        document.getElementById('gameOver').style.display = 'flex';
    }
    
    /**
     * Save game statistics to history
     * @param {number} efficiency - The efficiency percentage
     */
    saveToHistory(efficiency) {
        const gameData = {
            date: new Date().toLocaleDateString(),
            cards: this.boardWidth * this.boardHeight,
            flips: this.flips,
            efficiency: efficiency,
            timestamp: Date.now()
        };
        
        let history = getGameHistory();
        history.unshift(gameData); // Add to beginning
        
        // Keep only last 50 games
        if (history.length > 50) {
            history = history.slice(0, 50);
        }
        
        saveGameHistory(history);
    }
    
    /**
     * Reset the game to initial state
     */
    reset() {
        this.matchedPairs = 0;
        this.flips = 0;
        this.misses = 0;
        this.flippedCards = [];
        this.gameActive = true;
        this.initializeGame();
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
        
        // Only restart if orientation changed
        if (wasLandscape !== game.isLandscape) {
            game.reset();
        } else {
            // Just update the board layout
            game.renderBoard();
        }
    }
});

// Touch support for mobile devices
document.addEventListener('touchstart', function() {}, true);

// Prevent context menu on long press for mobile
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});
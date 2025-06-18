/**
 * Memory Card Game - UI Management
 * Handles screen navigation, menu interactions, and UI updates
 */

/**
 * Show a specific screen and hide others
 * @param {string} screenId - The ID of the screen to show
 */
function showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show the requested screen
    document.getElementById(screenId).classList.add('active');
    
    // Load content for specific screens
    if (screenId === 'historyScreen') {
        loadHistory();
    }
}

/**
 * Start a new game
 */
function startNewGame() {
    // Ensure we're on the game screen
    showScreen('gameScreen');
    // Reset and initialize the game
    if (game) {
        game.reset();
    }
}

/**
 * Close the game over modal
 */
function closeGameOver() {
    document.getElementById('gameOver').style.display = 'none';
}

/**
 * Exit the game (attempt to close window)
 */
function exitGame() {
    if (confirm('Are you sure you want to exit the game?')) {
        // Try different methods to close the window/app
        if (window.electronAPI) {
            // Electron app
            window.electronAPI.closeApp();
        } else if (navigator.app && navigator.app.exitApp) {
            // Cordova app
            navigator.app.exitApp();
        } else {
            // Web browser - attempt to close window
            window.close();
            
            // If window.close() doesn't work, show a message
            setTimeout(() => {
                alert('Please close the browser tab or window to exit the game.');
            }, 100);
        }
    }
}

/**
 * Load and display game history
 */
function loadHistory() {
    const history = getGameHistory();
    const historyList = document.getElementById('historyList');
    
    if (history.length === 0) {
        historyList.innerHTML = '<div class="no-history">No games played yet. Start your first game to see your history!</div>';
        return;
    }
    
    historyList.innerHTML = history.map(gameData => `
        <div class="history-item">
            <div class="history-date">${gameData.date}</div>
            <div class="history-stats">
                <div class="history-stat">Cards: ${gameData.cards}</div>
                <div class="history-stat">Flips: ${gameData.flips}</div>
                <div class="history-stat">Efficiency: ${gameData.efficiency}%</div>
            </div>
        </div>
    `).join('');
}

/**
 * Clear all game history
 */
function clearHistory() {
    if (confirm('Are you sure you want to clear your play history?')) {
        clearGameHistory();
        loadHistory();
    }
}

/**
 * Handle PWA installation prompt
 */
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    // Show install button if needed
    showInstallButton();
});

/**
 * Show install button for PWA
 */
function showInstallButton() {
    // You can add an install button to your UI here
    // For now, we'll just log that the app is installable
    console.log('App is installable');
}

/**
 * Install the PWA
 */
function installApp() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            }
            deferredPrompt = null;
        });
    }
}

/**
 * Handle keyboard shortcuts
 */
document.addEventListener('keydown', function(e) {
    // Escape key - go back or close modals
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
    
    // Enter key - start new game from main menu
    if (e.key === 'Enter') {
        const currentScreen = document.querySelector('.screen.active');
        if (currentScreen && currentScreen.id === 'mainMenu') {
            startNewGame();
        }
    }
    
    // N key - new game (when in game screen)
    if (e.key.toLowerCase() === 'n') {
        const currentScreen = document.querySelector('.screen.active');
        if (currentScreen && currentScreen.id === 'gameScreen') {
            startNewGame();
        }
    }
});

/**
 * Handle visibility change (tab focus/blur)
 */
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // Game is hidden, you could pause here if needed
        console.log('Game hidden');
    } else {
        // Game is visible again
        console.log('Game visible');
    }
});

/**
 * Show notifications (if supported)
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 */
function showNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body: body,
            icon: 'assets/icons/icon-192.png'
        });
    }
}

/**
 * Request notification permission
 */
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                showNotification('Memory Game', 'Notifications enabled!');
            }
        });
    }
}

/**
 * Initialize UI when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    // Request notification permission after a delay
    setTimeout(requestNotificationPermission, 3000);
    
    // Handle app installation
    window.addEventListener('appinstalled', (evt) => {
        console.log('App was installed');
        showNotification('Memory Game', 'Game installed successfully!');
    });
    
    // Add focus management for accessibility
    const firstScreen = document.querySelector('.screen.active');
    if (firstScreen) {
        const firstButton = firstScreen.querySelector('button');
        if (firstButton) {
            firstButton.focus();
        }
    }
});

/**
 * Handle online/offline status
 */
window.addEventListener('online', function() {
    console.log('Back online');
    // You could sync data here if needed
});

window.addEventListener('offline', function() {
    console.log('Gone offline');
    // Game still works offline thanks to service worker
});
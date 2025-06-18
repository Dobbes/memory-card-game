/**
 * Memory Card Game - Utility Functions
 * Helper functions for data management, storage, and common operations
 */

/**
 * Local Storage key for game history
 */
const STORAGE_KEY = 'memoryGameHistory';

/**
 * Get game history from localStorage
 * @returns {Array} Array of game history objects
 */
function getGameHistory() {
    try {
        const history = localStorage.getItem(STORAGE_KEY);
        return history ? JSON.parse(history) : [];
    } catch (error) {
        console.error('Error reading game history:', error);
        return [];
    }
}

/**
 * Save game history to localStorage
 * @param {Array} history - Array of game history objects
 */
function saveGameHistory(history) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
        console.error('Error saving game history:', error);
    }
}

/**
 * Clear all game history
 */
function clearGameHistory() {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error('Error clearing game history:', error);
    }
}

/**
 * Get device information
 * @returns {Object} Device info object
 */
function getDeviceInfo() {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTablet = /iPad|Android(?!.*Mobile)/i.test(userAgent);
    const isSteamDeck = /SteamDeck/i.test(userAgent) || /Valve Steam GamePad/i.test(userAgent);
    const isKindleFire = /KFOT|KFTT|KFJWI|KFJWA|KFSOWI|KFTHWI|KFTHWA|KFAPWI|KFAPWA|KFARWI|KFASWI|KFSAWI|KFSAWA/i.test(userAgent);
    
    return {
        userAgent,
        platform,
        isMobile,
        isTablet,
        isSteamDeck,
        isKindleFire,
        isDesktop: !isMobile && !isTablet,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        pixelRatio: window.devicePixelRatio || 1
    };
}

/**
 * Log device info for debugging
 */
function logDeviceInfo() {
    const info = getDeviceInfo();
    console.log('Device Info:', info);
}

/**
 * Format time duration
 * @param {number} milliseconds - Time in milliseconds
 * @returns {string} Formatted time string
 */
function formatTime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${remainingSeconds}s`;
}

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
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

/**
 * Throttle function to limit function calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Generate a random ID
 * @param {number} length - Length of the ID
 * @returns {string} Random ID string
 */
function generateId(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Validate if the browser supports required features
 * @returns {Object} Support status object
 */
function checkBrowserSupport() {
    const support = {
        localStorage: typeof(Storage) !== 'undefined',
        serviceWorker: 'serviceWorker' in navigator,
        notifications: 'Notification' in window,
        vibration: 'vibrate' in navigator,
        fullscreen: 'requestFullscreen' in document.documentElement,
        touch: 'ontouchstart' in window || navigator.maxTouchPoints > 0
    };
    
    return support;
}

/**
 * Calculate game statistics
 * @param {Array} history - Game history array
 * @returns {Object} Statistics object
 */
function calculateStats(history) {
    if (!history || history.length === 0) {
        return {
            totalGames: 0,
            averageFlips: 0,
            averageEfficiency: 0,
            bestEfficiency: 0,
            totalFlips: 0
        };
    }
    
    const totalGames = history.length;
    const totalFlips = history.reduce((sum, game) => sum + game.flips, 0);
    const totalEfficiency = history.reduce((sum, game) => sum + game.efficiency, 0);
    const bestEfficiency = Math.max(...history.map(game => game.efficiency));
    
    return {
        totalGames,
        averageFlips: Math.round(totalFlips / totalGames),
        averageEfficiency: Math.round(totalEfficiency / totalGames),
        bestEfficiency,
        totalFlips
    };
}

/**
 * Export game data as JSON
 * @returns {string} JSON string of game data
 */
function exportGameData() {
    const history = getGameHistory();
    const stats = calculateStats(history);
    const deviceInfo = getDeviceInfo();
    
    const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        deviceInfo,
        stats,
        history
    };
    
    return JSON.stringify(exportData, null, 2);
}

/**
 * Import game data from JSON
 * @param {string} jsonData - JSON string of game data
 * @returns {boolean} Success status
 */
function importGameData(jsonData) {
    try {
        const data = JSON.parse(jsonData);
        
        if (data.history && Array.isArray(data.history)) {
            saveGameHistory(data.history);
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Error importing game data:', error);
        return false;
    }
}

/**
 * Request fullscreen mode
 */
function requestFullscreen() {
    const element = document.documentElement;
    
    if (element.requestFullscreen) {
        element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
    }
}

/**
 * Exit fullscreen mode
 */
function exitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
}

/**
 * Vibrate device (if supported)
 * @param {number|Array} pattern - Vibration pattern
 */
function vibrate(pattern = 100) {
    if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
    }
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
        }
    } catch (error) {
        console.error('Error copying to clipboard:', error);
        return false;
    }
}

/**
 * Get current timestamp
 * @returns {number} Current timestamp in milliseconds
 */
function getCurrentTimestamp() {
    return Date.now();
}

/**
 * Initialize utilities when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    // Log device info for debugging
    logDeviceInfo();
    
    // Check browser support
    const support = checkBrowserSupport();
    console.log('Browser Support:', support);
    
    // Warn about missing features
    if (!support.localStorage) {
        console.warn('localStorage not supported - game history will not persist');
    }
    
    if (!support.serviceWorker) {
        console.warn('Service Worker not supported - offline functionality limited');
    }
});
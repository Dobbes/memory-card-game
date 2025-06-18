# Memory Card Game

A classic memory card game built with vanilla JavaScript, HTML5, and CSS3. Test your memory skills by matching pairs of playing cards! Compatible with Steam Deck, Windows, Kindle Fire, and all modern web browsers.

## 🎮 Features

- **Classic Gameplay**: Match pairs of playing cards to test your memory
- **Smart Miss Tracking**: Only counts as a miss when you've seen both cards before
- **Revealed Pairs Display**: Shows pairs where both cards have been flipped
- **Game Statistics**: Track flips, misses, and efficiency percentage
- **Play History**: View your past games and performance
- **Responsive Design**: Works on all screen sizes and orientations
- **Cross-Platform**: Runs on web browsers, desktop apps, and mobile devices
- **Offline Support**: Play without an internet connection
- **Celebration Animations**: Satisfying card match animations

## 🚀 Quick Start

### Web Browser
1. Clone or download this repository
2. Open `index.html` in any modern web browser
3. Start playing!

### Local Development Server
```bash
# Install a simple HTTP server (if you don't have one)
npm install -g http-server

# Navigate to the project directory
cd memory-card-game

# Start the server
npx http-server . -p 8080

# Open http://localhost:8080 in your browser
```

## 📱 Platform Deployment

### Steam Deck / Desktop (Electron)
```bash
# Install dependencies
npm install

# Run in development
npm start

# Build for current platform
npm run build

# Build for specific platforms
npm run build-win    # Windows
npm run build-mac    # macOS
npm run build-linux  # Linux
```

### Windows Standalone
1. Use the Electron build: `npm run build-win`
2. Or run directly in any web browser
3. Or package as PWA from Edge/Chrome

### Kindle Fire / Android (Cordova)
```bash
# Install Cordova globally
npm install -g cordova

# Navigate to project directory
cd memory-card-game

# Add Android platform
cordova platform add android

# Build for Android
npm run cordova-build-android

# Install on connected device
npm run cordova-run-android
```

### Progressive Web App (PWA)
- Open the game in Chrome, Edge, or Safari
- Look for "Install" or "Add to Home Screen" option
- The game will work offline after installation

## 🎯 How to Play

1. **Start a New Game**: Click cards to flip them and reveal their faces
2. **Match Pairs**: Try to find matching pairs of cards
3. **Memory Challenge**: Remember where you've seen cards to improve efficiency
4. **Track Progress**: Monitor your flips, misses, and efficiency percentage
5. **View History**: Check your past games and performance trends

## 🧠 Game Mechanics

- **Revealed Pairs**: Shows in the top bar when you've seen both cards of a pair
- **Miss Counting**: Only counts as a miss if you've previously seen both cards of a pair
- **Efficiency**: Calculated as (matched pairs × 2) ÷ total flips × 100%
- **Adaptive Layout**: Board switches between 4×5 and 5×4 based on screen orientation

## 🛠️ Technical Details

### File Structure
```
memory-card-game/
├── index.html              # Main HTML file
├── css/
│   ├── styles.css         # Main stylesheet
│   └── responsive.css     # Responsive design
├── js/
│   ├── game.js           # Game logic
│   ├── ui.js             # UI management
│   └── utils.js          # Utility functions
├── assets/               # Icons and images
├── electron/             # Electron app files
├── cordova/              # Mobile app config
├── manifest.json         # PWA manifest
└── sw.js                # Service worker
```

### Browser Compatibility
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+
- Mobile browsers (iOS Safari, Chrome Mobile)

### Platform Support
- ✅ **Web Browsers**: All modern browsers
- ✅ **Windows**: Electron app or web browser
- ✅ **Steam Deck**: Web browser or Electron app
- ✅ **Kindle Fire**: Silk browser or Cordova app
- ✅ **Mobile**: PWA or Cordova app
- ✅ **Desktop**: Electron app for native experience

## 🔧 Development

### Prerequisites
- Node.js 16+ (for Electron builds)
- npm 8+
- Android SDK (for Cordova Android builds)

### Development Commands
```bash
# Start development server
npm run serve

# Build Electron app
npm run build

# Test Cordova build
npm run cordova-prepare

# View in browser
open index.html
```

### Adding New Features
1. Game logic goes in `js/game.js`
2. UI interactions go in `js/ui.js`
3. Utility functions go in `js/utils.js`
4. Styles go in `css/styles.css` or `css/responsive.css`

## 📊 Game Statistics

The game tracks:
- **Total Flips**: Number of cards you've flipped
- **Misses**: Failed matches where you'd seen both cards before
- **Efficiency**: Percentage showing how close to perfect you played
- **Game History**: Date, card count, flips, and efficiency for each game

## 🎨 Customization

### Changing Card Designs
Edit the card styling in `css/styles.css`:
```css
.card {
    /* Modify card appearance */
}

.card.back {
    /* Modify card back design */
}
```

### Adding Sound Effects
1. Add audio files to `assets/sounds/`
2. Use the Web Audio API in `js/game.js`
3. Add sound toggle to options menu

### Modifying Grid Size
In `js/game.js`, adjust the board dimensions:
```javascript
this.boardWidth = 4;  // Cards wide
this.boardHeight = 5; // Cards tall
```

## 📋 License

MIT License - feel free to use this code for your own projects!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on multiple platforms
5. Submit a pull request

## 🐛 Troubleshooting

### Game Won't Start
- Ensure JavaScript is enabled
- Check browser console for errors
- Try refreshing the page

### Cards Not Responsive
- Check if touch events are working
- Verify CSS viewport settings
- Test on different screen sizes

### Electron Build Issues
- Update Node.js to latest LTS
- Clear npm cache: `npm cache clean --force`
- Reinstall dependencies: `rm -rf node_modules && npm install`

### Cordova Build Issues
- Ensure Android SDK is properly installed
- Check Java version compatibility
- Verify Cordova platform requirements

## 📞 Support

For issues, questions, or suggestions:
1. Check the troubleshooting section above
2. Search existing GitHub issues
3. Create a new issue with details about your problem
4. Include your platform, browser, and any error messages

Enjoy playing Memory Card Game! 🃏✨
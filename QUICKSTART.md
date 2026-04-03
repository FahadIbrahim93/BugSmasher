# BugSmasher - Quick Start Guide

## 1-Minute Setup

### Prerequisites
```bash
node --version  # Should be 16 or higher
npm --version   # Should be 8 or higher
```

### Installation
```bash
# Clone the repository
git clone https://github.com/FahadIbrahim93/BugSmasher.git
cd BugSmasher

# Install dependencies
npm install

# Start development server
npm run dev
```

The game will be available at `http://localhost:3000`

## Firebase Configuration

### Step 1: Create Firebase Project
1. Go to https://console.firebase.google.com
2. Click "Create a project"
3. Name it "BugSmasher"
4. Create the project

### Step 2: Enable Authentication
1. In Firebase Console, go to **Authentication**
2. Click **Get Started**
3. Enable **Google** provider (usually default)
4. Click **Sign up method** and ensure Google is enabled

### Step 3: Set Up Firestore Database
1. Go to **Firestore Database**
2. Click **Create Database**
3. Select **Start in test mode** (for development)
4. Choose **us-central1** as location
5. Create the database

### Step 4: Update Configuration
1. Copy your Firebase config from **Project Settings**
2. Update `firebase-applet-config.json`:
   ```json
   {
     "apiKey": "YOUR_API_KEY",
     "authDomain": "YOUR_PROJECT.firebaseapp.com",
     "projectId": "YOUR_PROJECT_ID",
     "storageBucket": "YOUR_PROJECT.appspot.com",
     "messagingSenderId": "YOUR_SENDER_ID",
     "appId": "YOUR_APP_ID",
     "firestoreDatabaseId": "(default)"
   }
   ```

### Step 5: Deploy Security Rules
```bash
# Install Firebase CLI if needed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy rules
firebase deploy --only firestore:rules
```

## First Playthrough

### Play as Guest
1. Open http://localhost:3000
2. Click **PLAY AS GUEST**
3. Select a hero class
4. Click **ENTER THE SWARM**
5. Use WASD to move, mouse to aim

### Authenticate & Save Progress
1. Logout from guest mode
2. Click **GOOGLE LOGIN** (or GitHub/Discord if configured)
3. Complete login flow
4. Your progress will now be saved
5. On next visit, your high score will be restored

## Controls

### Keyboard
- **WASD**: Move
- **Mouse**: Aim
- **Click/Hold**: Attack
- **Q/W/E/R**: Abilities
- **TAB**: Toggle Auto-attack
- **ESC**: Pause (if implemented)

### Mobile
- **Left side**: Virtual joystick (move)
- **Right side**: Fire button (attack)
- **Bottom**: Ability buttons

## Troubleshooting

### Game Won't Start
```bash
# Check if all dependencies installed
npm install

# Verify TypeScript compiles
npm run lint

# Check browser console (F12) for errors
```

### Login Not Working
1. Verify Firebase config in `firebase-applet-config.json`
2. Check Firebase Console > Authentication > Settings
3. Ensure redirect URIs include `http://localhost:3000`
4. Check browser console for specific error messages

### Database Not Saving
1. Verify Firestore is created in Firebase Console
2. Check that security rules are deployed: `firebase deploy --only firestore:rules`
3. Check browser console for Firestore errors
4. Verify user is authenticated before saving

### Low FPS or Performance Issues
1. Open DevTools (F12)
2. Go to Performance tab
3. Record gameplay for 10 seconds
4. Check Performance tab for bottlenecks
5. Check if particle count is high (can reduce in engine.ts if needed)

## File Structure Quick Reference

```
BugSmasher/
├── src/
│   ├── App.tsx                 # Main React component
│   ├── main.tsx                # Entry point
│   ├── index.css               # Styles
│   ├── firebase.ts             # Firebase setup
│   ├── store.ts                # Game state management
│   ├── game/                   # Game logic
│   │   ├── engine.ts           # Main game loop
│   │   ├── player.ts           # Player class
│   │   ├── enemies.ts          # Enemy types
│   │   ├── upgrades.ts         # Upgrade system
│   │   └── ...
│   ├── services/               # Backend services
│   │   ├── database.ts         # Firebase operations
│   │   ├── leaderboard.ts      # Ranking system
│   │   ├── guest.ts            # Guest mode
│   │   └── ...
│   └── components/             # React components
│       ├── AuthPanel.tsx       # Login UI
│       └── Leaderboard.tsx     # Leaderboard display
├── firebase-applet-config.json # Firebase config (KEEP SECRET!)
├── firestore.rules             # Database security rules
└── index.html                  # HTML template
```

## Environment Variables (Optional)

Create `.env.local` for additional configuration:
```env
VITE_DEBUG=false
VITE_PARTICLE_MAX=1000
```

## npm Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Check TypeScript compilation
npm run clean    # Remove dist folder
```

## Game Modes

### Guest Mode
- **No login required**
- **In-memory stats only**
- **No data persistence**
- **Good for**: Quick testing, demos

### Authenticated Mode
- **Login required** (Google/GitHub/Discord)
- **Full progression saved**
- **Appears on leaderboards**
- **Good for**: Real gameplay sessions

## Tips for First Game

1. **Movement**: WASD keys move relative to screen, not player direction
2. **Aiming**: Move mouse in direction you want to shoot
3. **Abilities**: Selected upgrades give you special abilities (Q/W/E/R)
4. **Wave Mechanic**: Every 5 waves is "Apex Predator" wave (harder)
5. **Combo System**: Kill enemies quickly to build combo multiplier
6. **Upgrades**: When prompted, choose upgrades that match your playstyle

## Next Steps

After basic setup:
1. Read `TESTING_GUIDE.md` for comprehensive testing
2. Read `GUEST_MODE_GUIDE.md` for guest mode details
3. Read `ISSUES_AND_FIXES.md` for known issues
4. Check `README.md` for full documentation

## Getting Help

### Common Issues

**"Firebase is not initialized"**
- Check `firebase-applet-config.json` has correct values
- Verify internet connection

**"Permission denied" error**
- Deploy security rules: `firebase deploy --only firestore:rules`
- Ensure user is authenticated

**Black screen with no UI**
- Open DevTools (F12) and check Console tab
- Look for any error messages starting with `[v0]`
- Try refreshing page

**Game lags or low FPS**
- Check browser DevTools Performance tab
- Consider closing other tabs
- Check if particle count is high

### Debug Mode

To enable debug logging:
```javascript
// In browser console
localStorage.setItem('v0-debug', 'true');
// Reload page
```

## Support

- **Issues**: Open GitHub issue with `[v0]` errors from console
- **Docs**: Check markdown files in project root
- **Firebase Docs**: https://firebase.google.com/docs
- **React Docs**: https://react.dev

## What's Next?

1. **Play a few games** to understand mechanics
2. **Test authentication** with each provider
3. **Check database** - play authenticated and see data appear in Firestore
4. **Read full documentation** for advanced features
5. **Customize** - modify upgrades, enemies, or abilities

Enjoy BugSmasher!

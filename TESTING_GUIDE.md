# BugSmasher Testing & Troubleshooting Guide

## Pre-Testing Checklist

### 1. Environment Setup
- [ ] Node.js 16+ installed
- [ ] npm or yarn package manager available
- [ ] Firebase account configured
- [ ] Git repository cloned and on correct branch

### 2. Dependency Verification
```bash
# Install dependencies
npm install

# Verify all packages installed correctly
npm list

# Check TypeScript compilation
npm run lint
```

### 3. Configuration Files
- [ ] `firebase-applet-config.json` exists and has valid Firebase credentials
- [ ] All environment variables are set (if using .env.local)
- [ ] Vite config is properly configured for HMR

## Common Issues & Solutions

### Issue 1: Firebase Authentication Not Working

**Symptoms:**
- Login buttons don't respond
- "Firebase is not initialized" error
- Auth state listener not firing

**Solutions:**
1. Verify Firebase credentials in `firebase-applet-config.json`
2. Check if Firebase Auth is enabled in Firebase Console
3. Verify OAuth providers are configured:
   - Google OAuth: Ensure redirect URI includes your domain
   - GitHub OAuth: Check client ID and secret
   - Discord OIDC: Verify configuration is correct

**Test Command:**
```javascript
// In browser console
firebase.auth().currentUser
// Should return user object or null, not undefined
```

### Issue 2: Game Canvas Not Rendering

**Symptoms:**
- Black screen or empty game area
- Canvas size is 0
- Game state stuck on "loading"

**Solutions:**
1. Check if canvas elements exist in DOM:
   ```javascript
   document.getElementById('game-canvas') // Should exist
   document.getElementById('minimap-canvas') // Should exist
   ```
2. Verify canvas refs are properly attached in App.tsx
3. Check console for WebGL errors
4. Ensure `initGame()` is called with valid canvas references

### Issue 3: Guest Mode Not Working

**Symptoms:**
- "PLAY AS GUEST" button not visible
- Click doesn't start guest session
- Session data not updating

**Solutions:**
1. Verify `AuthPanel.tsx` has guest mode button
2. Check `guest.ts` service is properly exported
3. Ensure guest state is initialized in App.tsx
4. Test in browser console:
   ```javascript
   import { isGuestMode } from './services/guest'
   isGuestMode() // Should return true when in guest mode
   ```

### Issue 4: Database Operations Failing

**Symptoms:**
- "Permission denied" errors in console
- User data not saving
- Leaderboard not loading

**Solutions:**
1. Deploy Firestore security rules:
   ```bash
   firebase deploy --only firestore:rules
   ```
2. Verify user authentication before database calls
3. Check if document exists before reading:
   ```javascript
   const docRef = doc(db, 'players', userId);
   const docSnap = await getDoc(docRef);
   if (docSnap.exists()) {
     // Handle data
   } else {
     // Create new document
   }
   ```

### Issue 5: Upgrades Not Applying

**Symptoms:**
- Selected upgrades don't affect player stats
- Game continues without pause for upgrades
- UI shows upgrades but no effect in game

**Solutions:**
1. Verify `handleSelectUpgrade()` is properly connected in App.tsx
2. Check that upgrade IDs match the pattern checking in the handler
3. Ensure `resumeGame()` is called after upgrade application
4. Test in console:
   ```javascript
   player.attackDamage // Log before and after selecting dmg upgrade
   ```

## Performance Testing

### FPS Monitoring
```javascript
// Check performance monitor in-game
// Look for "perf" element which displays FPS
document.getElementById('perf').innerText
// Should show FPS values and frame time
```

### Memory Usage
1. Open DevTools (F12)
2. Go to Performance tab
3. Record for 30 seconds during active gameplay
4. Check for memory leaks:
   - Should stabilize after initial load
   - No continuous upward trend

### Network Traffic
1. Open DevTools Network tab
2. Play for 1-2 waves as guest (no Firebase calls)
3. Play for 1-2 waves authenticated (Firebase saves)
4. Check:
   - No excessive requests
   - Game works offline
   - Leaderboard queries are batched

## Feature Testing Checklist

### Authentication
- [ ] Google login works
- [ ] GitHub login works
- [ ] Discord login works
- [ ] Guest mode works
- [ ] Logout works
- [ ] Session persists on page reload
- [ ] User info displays correctly

### Game Core
- [ ] Title screen appears
- [ ] Class selection shows all 4 classes
- [ ] Game starts with selected class
- [ ] Player can move with WASD
- [ ] Mouse/touch controls work
- [ ] Enemies spawn correctly
- [ ] Waves progress correctly

### Gameplay Features
- [ ] Health bar updates
- [ ] Score increases on kills
- [ ] Wave counter increments
- [ ] Abilities cooldown properly
- [ ] Upgrades can be selected
- [ ] Game over triggers correctly
- [ ] High score tracking works

### Data Persistence
- [ ] Authenticated players: High score saved
- [ ] Authenticated players: Stats persist on reload
- [ ] Guest players: Session stats tracked
- [ ] Guest players: Data cleared on exit

### UI/UX
- [ ] Buttons are clickable with proper feedback
- [ ] Text is readable (good contrast)
- [ ] Mobile touch controls work on phone
- [ ] Animations are smooth (60 FPS)
- [ ] Error messages are clear

## Test Scenarios

### Scenario 1: Complete Authenticated Playthrough
1. Start game
2. Login with Google/GitHub/Discord
3. Select a class
4. Play until game over
5. Verify high score saved in database
6. Logout
7. Login again
8. Verify high score persists

### Scenario 2: Guest Mode Session
1. Click "PLAY AS GUEST"
2. Select a class
3. Play until game over
4. Verify "Guest Mode" label shown
5. Exit guest mode
6. Verify returning to login screen

### Scenario 3: Upgrade Selection
1. Start game and play
2. Wait for upgrade screen
3. Select different upgrades
4. Verify stats change
5. Complete wave and verify effects persist

### Scenario 4: Mobile Testing
1. Open game on mobile device
2. Test joystick control (left side)
3. Test fire control (right side)
4. Test ability buttons (bottom)
5. Verify touch responsiveness
6. Play complete game on mobile

## Browser Compatibility

Test on:
- [ ] Chrome/Chromium (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari

## Debugging Commands

Run in browser console during gameplay:

```javascript
// Check game state
console.log(gameState)

// Check player stats
import { getPlayerState } from './game/engine'
getPlayerState()

// Check guest mode
import { getGuestStats } from './services/guest'
getGuestStats()

// Monitor Firebase operations
firebase.firestore().enableLogging(true)

// Check authentication
firebase.auth().currentUser

// Performance metrics
performance.now() // Get current timestamp
```

## Performance Targets

- **FPS**: 60 stable during gameplay
- **Load Time**: <3 seconds to reach title screen
- **Memory**: <150MB baseline, <250MB during active gameplay
- **Network**: <100KB per game session (authenticated)

## Known Limitations

1. **Firestore**: Free tier has 50,000 read/write operations per day
2. **Real-time Updates**: Leaderboard updates may have 5-second delay
3. **Mobile**: Best experience on devices with 1GB+ RAM
4. **Particles**: Capped at 1000 active particles for performance

## Reporting Issues

When reporting bugs, include:
1. Browser and OS version
2. Steps to reproduce
3. Screenshot/video of issue
4. Console error messages
5. Network tab logs (if applicable)
6. Whether issue occurs in guest or authenticated mode

## Test Results Template

```markdown
# Test Results - [Date]

## Environment
- Node Version: [x.x.x]
- Browser: [Browser Name, Version]
- OS: [Windows/Mac/Linux, Version]
- Mode: [Guest/Authenticated]

## Tests Passed
- [x] Authentication
- [x] Game Rendering
- [ ] [Feature Name]

## Issues Found
1. [Issue Description]
   - Steps to reproduce: ...
   - Expected: ...
   - Actual: ...

## Performance Metrics
- FPS: [Average]
- Load Time: [Seconds]
- Memory: [MB]

## Recommendations
- [Improvement 1]
- [Improvement 2]
```

## Next Steps

After testing:
1. Document all issues found
2. Create GitHub issues for bugs
3. Prioritize fixes by severity
4. Re-test after fixes
5. Prepare deployment checklist

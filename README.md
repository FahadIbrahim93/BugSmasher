<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# BugSmasher - Enterprise-Grade AAA Game Edition

An advanced, production-ready tower-defense/survivor game with enterprise-grade features, robust authentication, and comprehensive analytics. Built with React, Firebase, and modern game development patterns.

## Features

### Game Features
- **Multiple Hero Classes**: Warrior, Rogue, Ranger, Mage with unique abilities and playstyles
- **Advanced Upgrade System**: Dynamic upgrade selection with rarity-based progression
- **Wave-Based Difficulty**: Escalating challenges with special apex predator waves every 5th wave
- **Combo System**: Risk/reward multiplier mechanics for aggressive play
- **Particle Effects & Audio**: Full audio design with sound effects and visual feedback
- **Mobile Support**: Touch controls for joystick and ability buttons

### Enterprise Features
- **Multi-Provider Authentication**: Google, GitHub, and Discord OAuth integration
- **Guest Mode**: Play without authentication with in-session statistics tracking
- **Robust Database Backend**: Firebase with secure RLS policies
- **Achievement System**: 15+ unlockable achievements with rarity tiers
- **Leaderboards**: Multiple ranking systems (High Score, Max Wave, Total Kills, Playtime, Achievements)
- **Advanced Statistics**: Comprehensive game metrics tracking
- **Performance Monitoring**: FPS tracking and optimization suggestions
- **Analytics & Telemetry**: Event-based analytics for user engagement and gameplay metrics
- **Persistent User Data**: All authenticated player progress saved to Firebase

## Architecture

### Directory Structure
```
src/
├── game/
│   ├── engine.ts           # Main game loop and logic
│   ├── player.ts           # Player class and hero definitions
│   ├── enemies.ts          # Enemy types and behavior
│   ├── upgrades.ts         # Upgrade system
│   ├── achievements.ts     # Achievement definitions and tracking
│   ├── statistics.ts       # Game statistics recorder
│   ├── particles.ts        # Particle effect system
│   ├── audio.ts            # Audio management
│   └── renderer.ts         # Canvas rendering
├── services/
│   ├── database.ts         # Firebase database operations
│   ├── leaderboard.ts      # Leaderboard management
│   ├── performance.ts      # Performance monitoring
│   ├── analytics.ts        # Analytics and telemetry
│   └── guest.ts            # Guest mode management
├── components/
│   ├── AuthPanel.tsx       # Multi-provider authentication UI
│   └── Leaderboard.tsx     # Leaderboard display component
└── App.tsx                 # Main React component
```

## Run Locally

**Prerequisites:**  Node.js 16+, npm/yarn, Firebase account

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up Firebase configuration in `firebase-applet-config.json`:
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

3. Configure authentication providers in Firebase Console:
   - Enable Google OAuth
   - Enable GitHub OAuth
   - Enable Discord OIDC
   - Set authorized redirect URIs to `http://localhost:3000`

4. Deploy Firestore security rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open http://localhost:3000 in your browser

## API Reference

### Database Service
```typescript
import { dbService, PlayerStats } from './services/database';

// Save player stats
await dbService.savePlayerStats(user, stats);

// Get player stats
const stats = await dbService.getPlayerStats(userId);

// Save game run
const runId = await dbService.saveGameRun(userId, gameRun);

// Subscribe to real-time updates
const unsubscribe = dbService.subscribeToPlayerStats(userId, (stats) => {
  console.log('Stats updated:', stats);
});
```

### Leaderboard Service
```typescript
import { leaderboardService, LeaderboardType } from './services/leaderboard';

// Build leaderboard
const entries = leaderboardService.buildLeaderboard(
  playersList,
  'highScore' as LeaderboardType,
  100
);

// Get player rank
const rank = leaderboardService.getPlayerRank(playersList, 'highScore', userId);
```

### Analytics Service
```typescript
import { analyticsService } from './services/analytics';

// Track custom event
analyticsService.trackEvent('custom_event', { key: 'value' });

// Track game end
analyticsService.trackGameEnd(score, wave, kills, duration, survived);

// Track achievement
analyticsService.trackAchievementUnlocked(achievementId, achievementName);
```

### Guest Mode Service
```typescript
import { 
  createGuestSession, 
  isGuestMode, 
  endGuestSession,
  getGuestDisplayName,
  updateSessionStats,
  getGuestStats 
} from './services/guest';

// Create a guest session
const session = createGuestSession();
// Returns: GuestSession with sessionId, startTime, displayName

// Check if in guest mode
if (isGuestMode()) {
  console.log('Playing as guest');
}

// Update session stats during gameplay
updateSessionStats(currentScore, currentWave, killCount);

// Get guest stats
const stats = getGuestStats();
// Returns: { highScore, maxWave, totalKills, sessionScore, sessionWave, sessionKills, playTime, displayName }

// End guest session and return to login
endGuestSession();
```

### Achievement Manager
```typescript
import { achievementManager } from './game/achievements';

// Check for new achievements
const newAchievements = achievementManager.checkAchievementUnlock(
  score, wave, kills, heroClass, hp, maxHp, totalRuns
);

// Get unlocked achievements
const unlocked = achievementManager.getUnlockedAchievements();
```

## Performance Considerations

- **60 FPS Target**: Game is optimized for smooth 60 FPS gameplay
- **Memory Management**: Efficient particle system with pooling
- **Network**: Database operations batched to minimize Firestore costs
- **Caching**: Leaderboards cached for 5 minutes to reduce query load

## Security

- **Firebase Security Rules**: Row-level security (RLS) enforced on all collections
- **OAuth**: Secure authentication via Google, GitHub, and Discord
- **No Hardcoded Secrets**: All sensitive data from environment variables
- **Input Validation**: All user inputs validated before database operations

## Deployment

### Vercel
```bash
npm run build
vercel deploy
```

### Firebase Hosting
```bash
npm run build
firebase deploy
```

## Development

### Code Quality
- TypeScript for type safety
- ESLint configuration (recommended)
- Performance monitoring enabled by default

### Testing
Run the game and verify:
1. Authentication flows work with all providers
2. Game saves progress to Firebase
3. Leaderboards update correctly
4. Achievements unlock as expected
5. Performance metrics are captured

## Troubleshooting

### Authentication Issues
- Verify Firebase configuration in `firebase-applet-config.json`
- Check that OAuth providers are enabled in Firebase Console
- Ensure redirect URIs match your app domain

### Database Errors
- Check Firestore security rules are deployed
- Verify user has correct permissions
- Check browser console for detailed error messages

### Performance Issues
- Check performance monitor for FPS drop causes
- Reduce particle count if needed
- Monitor memory usage with DevTools

## Future Enhancements

- [ ] Multiplayer support with real-time collaboration
- [ ] Advanced procedural level generation
- [ ] In-game marketplace with cosmetics
- [ ] Discord/Twitch integration
- [ ] Mobile app with native performance
- [ ] AI-powered difficulty scaling

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.

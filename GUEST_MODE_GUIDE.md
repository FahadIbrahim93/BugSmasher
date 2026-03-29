# Guest Mode Guide

## Overview

Guest Mode allows players to jump straight into gameplay without creating an account or authenticating through social providers. This feature is perfect for:
- First-time players who want to try the game immediately
- Players on devices without social authentication setup
- Testing and experimentation without data persistence
- Quick gameplay sessions

## Key Characteristics

### Guest Sessions
- **No Authentication Required**: No login, registration, or social provider needed
- **Session-Based**: Statistics are tracked only for the current session
- **In-Memory Storage**: All data exists only in RAM, cleared when session ends
- **Unique Identity**: Each guest session gets a unique session ID and display name
- **No Data Persistence**: Progress is NOT saved to the database

### Session Statistics

Guest mode tracks the following in-memory metrics:

```typescript
{
  sessionScore: number;        // Current session score
  sessionWave: number;         // Current session wave
  sessionKills: number;        // Current session kills
  highScore: number;           // Best score in this session
  maxWave: number;             // Best wave in this session
  totalKills: number;          // Total kills in this session
  playTime: number;            // Session duration in milliseconds
  displayName: string;         // Auto-generated guest name (e.g., "Guest_1234")
  sessionDuration: number;     // Time since session start
}
```

## User Flow

### 1. Login Screen
When a player is not authenticated, they see three options:
- **Google Login** - Authenticate with Google account
- **GitHub Login** - Authenticate with GitHub account
- **Discord Login** - Authenticate with Discord account
- **Play as Guest** - Enter guest mode directly

### 2. Guest Session Creation
When "Play as Guest" is clicked:
- A new guest session is created with a unique session ID
- A random display name is generated (e.g., "Guest_7234")
- Player is taken to class selection screen
- UI shows "(GUEST MODE)" indicator

### 3. Gameplay
- Gameplay is identical to authenticated mode
- All controls, classes, abilities, and upgrades work the same
- Statistics are tracked in-memory

### 4. Game Over
- Final score and waves survived are displayed
- Session statistics are shown (e.g., "SESSION HIGH SCORE: 5000 | MAX WAVE: 15")
- A note indicates "progress not saved"
- Player can click "Return to Nest" to go back to login

### 5. Returning to Login
From the title screen in guest mode:
- Player sees their guest display name (e.g., "WELCOME, GUEST_7234")
- "(GUEST MODE)" label is visible
- "EXIT GUEST MODE" button is available
- Clicking EXIT clears the session and returns to login options

## Implementation Details

### Creating Guest Sessions

```typescript
import { createGuestSession, isGuestMode } from './services/guest';

// Create session
const session = createGuestSession();
console.log(session.displayName); // e.g., "Guest_1234"

// Check if in guest mode
if (isGuestMode()) {
  // Handle guest-specific behavior
}
```

### Tracking Gameplay Statistics

```typescript
import { updateSessionStats, getGuestStats } from './services/guest';

// During gameplay, update stats
const playerState = getPlayerState();
updateSessionStats(playerState.score, playerState.wave, playerState.kills);

// At game end
const stats = getGuestStats();
console.log(`Final Score: ${stats.sessionScore}, Best: ${stats.highScore}`);
```

### Ending Guest Sessions

```typescript
import { endGuestSession } from './services/guest';

// When player exits guest mode
endGuestSession();
// Session data is cleared, player returns to login
```

## Code Architecture

### Guest Service (`src/services/guest.ts`)

The guest mode service provides:
- `createGuestSession()` - Initialize new guest session
- `getCurrentGuestSession()` - Get active session info
- `isGuestMode()` - Check if currently in guest mode
- `endGuestSession()` - Terminate guest session
- `getSessionDuration()` - Get time since session start
- `getGuestDisplayName()` - Get guest's display name
- `updateSessionStats()` - Update in-memory statistics
- `getGuestStats()` - Get all session statistics

### Integration Points

**App.tsx**:
- Uses `isGuest` state to track guest mode
- Calls `createGuestSession()` when "Play as Guest" is clicked
- Calls `endGuestSession()` when exiting guest mode
- Displays guest name and mode indicator on title screen
- Shows session stats on game over screen instead of database stats

**AuthPanel.tsx**:
- Added `onPlayAsGuest` callback
- New "PLAY AS GUEST" button with visual separator
- Informational text: "(No account or data saved)"

## Player Experience

### Advantages for Players
✓ Instant gameplay - no waiting for login
✓ No account needed - reduces friction
✓ Privacy-friendly - no data collection
✓ Experimentation - try classes and strategies risk-free
✓ Quick sessions - perfect for short play periods

### Limitations (Clearly Communicated)
✗ No progress saving - stats reset on exit
✗ No achievements - accomplishments not recorded
✗ No leaderboards - can't compete globally
✗ Session-only - data lost on browser close
✗ No cloud sync - isolated gameplay

## Analytics Considerations

When implementing analytics:
- Guest sessions should be tagged separately from authenticated players
- Distinguish between guest and authenticated analytics events
- Track conversion: how many guests later create accounts
- Monitor guest session engagement to optimize UI/UX
- Consider guest churn rate and bounce rates

## Future Enhancements

Potential improvements to guest mode:
- [ ] Anonymous leaderboards (separate from authenticated players)
- [ ] Guest-to-account conversion flow (save guest stats if you create account)
- [ ] Share guest high scores as QR codes or short links
- [ ] Guest-only challenges or temporary events
- [ ] Replay system for guest sessions
- [ ] Guest data export (JSON) before session ends

## Security Notes

Guest mode security considerations:
- Guest data is never sent to Firebase
- No authentication tokens required
- No personal information collected
- Session IDs are unique but not cryptographically secure (not needed)
- All data is automatically cleared on session end

## Troubleshooting

**Player confused about "Guest Mode"**
- UI clearly indicates "(GUEST MODE)" on screen
- Game Over screen shows "progress not saved"
- Guest button has explanatory text "(No account or data saved)"

**Player data lost on accidental exit**
- This is expected behavior for guest mode
- Communicate upfront that guest progress is temporary
- Provide prompt to create account after first game

**Converting guest to authenticated player**
- Currently, conversion is not automatic
- Future enhancement could save guest stats on account creation
- For now, players start fresh with authenticated account

## Examples

### Complete Guest Session Flow

```typescript
// 1. Player clicks "Play as Guest"
import { createGuestSession } from './services/guest';
const session = createGuestSession();
// Session created: sessionId="guest_1234567_abc123", displayName="Guest_7234"

// 2. Player selects class and plays
import { updateSessionStats } from './services/guest';
// During game: updateSessionStats(2500, 12, 45);

// 3. Game ends
import { getGuestStats } from './services/guest';
const stats = getGuestStats();
// stats = { sessionScore: 2500, sessionWave: 12, highScore: 2500, ... }

// 4. Player returns to title screen
// Shows: "WELCOME, GUEST_7234 (GUEST MODE)"

// 5. Player clicks "Exit Guest Mode"
import { endGuestSession } from './services/guest';
endGuestSession();
// Session cleared, player returns to login screen
```

## Questions?

For issues or questions about guest mode, check the main README or open an issue on GitHub.

# BugSmasher Developer Quick Reference

## Quick Facts

**Current Quality**: 7.2/10  
**Target Quality**: 9.5/10  
**Status**: Fully Functional ✓  
**Ready to Test**: YES ✓  

---

## Start Development (5 minutes)

```bash
# Install
npm install

# Develop
npm run dev

# Open http://localhost:3000

# Play as Guest to test
```

---

## Game Quick Reference

| Aspect | Status | File | Notes |
|--------|--------|------|-------|
| Core Engine | ✓ SOLID | `src/game/engine.ts` | 1000+ lines, well-organized |
| Rendering | ✓ EXCELLENT | `src/game/renderer.ts` | Procedural insect system |
| Particles | ✓ GREAT | `src/game/particles.ts` | Multiple shapes, good perf |
| **Audio** | ⚠ BASIC | `src/game/audio.ts` | Only 4 SFX, no music |
| **UI/UX** | ⚠ MINIMAL | `src/App.tsx` | Missing: pause, tutorial |
| Database | ✓ COMPLETE | `src/services/database.ts` | Firebase integration |
| Auth | ✓ COMPLETE | `src/firebase.ts` | Google/GitHub/Discord |
| Feedback | ✓ NEW | `src/game/feedback.ts` | Screen shake, effects |

---

## Current Issues

### Fixed (4)
- [x] Enemy type references - FIXED
- [x] Boss spawn type - FIXED
- [x] HUD class name - FIXED
- [x] Ability bar class - FIXED

### Todo (Priority Order)
1. **Add background music** (3h)
2. **Expand SFX** (2h)
3. **Pause menu** (2h)
4. **Tutorial** (4h)
5. **Visual polish** (12h)

---

## Key Code Locations

### Game Loop
```
src/game/engine.ts
├── startGame() - Initialize
├── update(dt) - Physics/logic
├── draw(ctx) - Rendering
└── gameLoop() - Main loop (requestAnimationFrame)
```

### Visual Feedback (NEW)
```
src/game/feedback.ts
├── spawnDamageNumber() - Damage display
├── triggerScreenShake() - Camera feedback
├── triggerCombatEffect() - Particle effects
└── updateScreenShake(dt) - Update shake
```

### Rendering System
```
src/game/renderer.ts
├── drawBeetle() - Hero rendering
├── getPalette() - Color system
└── drawBar() - Health bars
```

### Particle System
```
src/game/particles.ts
├── Particle class
├── spawnParticles()
└── Multiple shapes (circle, spark, ring, glow)
```

---

## Adding a Feature: Step-by-Step

### Example: Add Pause Menu

**Step 1**: Add UI in `src/App.tsx`
```typescript
const [isPaused, setIsPaused] = useState(false);

// In JSX
<div className={isPaused ? 'pause-menu show' : 'pause-menu'}>
  <h2>PAUSED</h2>
  <button onClick={() => setIsPaused(false)}>RESUME</button>
</div>
```

**Step 2**: Add toggle in `src/game/engine.ts`
```typescript
if (keys['Escape']) {
  setIsPaused(!isPaused);
  isPlaying = !isPlaying;
}
```

**Step 3**: Add CSS in `src/index.css`
```css
.pause-menu {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.8);
  z-index: 1000;
}

.pause-menu.show {
  display: flex;
}
```

**Step 4**: Test in browser

---

## Important Game Values

### Player Stats
```typescript
player = {
  x: number,
  y: number,
  hp: number,
  maxHp: number,
  attackDamage: number,
  heroClass: HERO_CLASS,
  abilities: Ability[],
  upgrades: Upgrade[]
}
```

### Wave Difficulty
```typescript
wave = 1;          // Current wave (increments every 20s)
spawnRate = 1.5;   // Increases with wave
enemyHealth *= (1 + wave * 0.15);  // Enemy scaling
```

### Classes (4)
```
- Warrior: Tank, high HP
- Ranger: Ranged, medium DPS
- Mage: Controller, AoE
- Rogue: Assassin, burst damage
```

### Enemies (13)
```
Weak: ant, beetle, wasp, scout
Medium: soldier, moth, spitter, tank
Strong: berserker, shaman, charger
Elite: phantom, hiveMother, voidQueen
```

---

## Performance Targets

**FPS**: 60+ at 50 enemies, 50+ at 100 enemies  
**Memory**: < 200 MB  
**Bundle**: < 500 KB gzipped  

**Monitor**:
```typescript
console.log(`FPS: ${1/dt}`);
console.log(`Enemies: ${enemies.length}`);
console.log(`Particles: ${particles.length}`);
```

---

## Debugging Tips

### Enable Debug Logs
```typescript
// In src/game/engine.ts
const DEBUG = true;

if (DEBUG) {
  console.log('[DEBUG] Wave:', wave);
  console.log('[DEBUG] FPS:', fps);
  console.log('[DEBUG] Enemies:', enemies.length);
}
```

### Check Canvas
```typescript
// In browser console
document.querySelector('canvas').width;      // Should match window
document.querySelector('canvas').height;

// Test rendering
const ctx = canvas.getContext('2d');
ctx.fillStyle = 'red';
ctx.fillRect(0,0,100,100);
```

### Performance Profile
```
Chrome DevTools → Performance tab → Record
1. Play for 30 seconds
2. Stop recording
3. Check "FPS" chart
4. Look for long frames (>16ms is bad at 60fps)
```

---

## Common Bugs & Fixes

### Screen Blank During Gameplay
**Check**:
1. Is `gameState === 'playing'`?
2. Is canvas getting rendered?
3. Is camera transform correct?

**Debug**:
```typescript
console.log('[DEBUG] gameState:', gameState);
console.log('[DEBUG] canvasWidth:', canvasWidth);
console.log('[DEBUG] Player pos:', player.x, player.y);
```

### Enemies Not Spawning
**Check**:
1. Are enemy types valid?
2. Is spawn rate > 0?
3. Is wave > 0?

**Debug**:
```typescript
console.log('[DEBUG] Enemies:', enemies.length);
console.log('[DEBUG] Spawn rate:', spawnRate);
console.log('[DEBUG] Enemy types:', Object.keys(ENEMY_TYPES));
```

### Abilities Not Working
**Check**:
1. Is cooldown <= 0?
2. Is key pressed (keys['q'], etc)?
3. Is playerState 'playing'?

**Debug**:
```typescript
console.log('[DEBUG] Ability cooldown:', player.abilities[0].cooldown);
console.log('[DEBUG] Keys:', keys);
console.log('[DEBUG] State:', gameState);
```

---

## Testing Checklist

**Before Pushing**:
- [ ] No console errors
- [ ] Game starts without issues
- [ ] Can play 1 full game (wave 1-5)
- [ ] Menu/class select works
- [ ] Guest mode works
- [ ] Game over screen shows
- [ ] FPS stable (60+)
- [ ] No memory leaks (DevTools)

---

## Next Features to Add

### Easiest (4 hours)
1. **Pause Menu** - UI only
2. **Settings Panel** - Volume control
3. **Game Over Stats** - Display data

### Medium (10 hours)
1. **Background Music** - Single track
2. **Tutorial Modals** - Progressive hints
3. **Daily Challenge** - Weekly modifier

### Complex (20+ hours)
1. **New Classes** - 5 new hero types
2. **Visual Effects** - Parallax backgrounds
3. **Cosmetics** - Skin/color system

---

## File Structure

```
src/
├── App.tsx              # Main React component
├── main.tsx             # Entry point
├── index.css            # Global styles
├── firebase.ts          # Auth setup
├── store.ts             # User data management
│
├── game/
│   ├── engine.ts        # Main game loop (1000+ lines)
│   ├── renderer.ts      # Drawing system
│   ├── particles.ts     # Particle system
│   ├── feedback.ts      # Visual feedback (NEW)
│   ├── player.ts        # Player class
│   ├── enemies.ts       # Enemy definitions
│   ├── upgrades.ts      # Upgrade system
│   ├── achievements.ts  # Achievement tracking
│   ├── audio.ts         # Sound system
│   ├── statistics.ts    # Game stats
│   └── utils.ts         # Utilities
│
├── services/
│   ├── database.ts      # Firebase operations
│   ├── leaderboard.ts   # Ranking system
│   ├── analytics.ts     # Event tracking
│   ├── guest.ts         # Guest mode
│   └── performance.ts   # Perf monitoring
│
└── components/
    ├── AuthPanel.tsx    # Login UI
    └── Leaderboard.tsx  # Rankings display
```

---

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run preview         # Preview production build

# Testing
npm run lint            # Check code quality
npm run type-check      # TypeScript checking

# Deployment
npm run deploy          # Deploy to Vercel (if configured)
```

---

## Where to Find Things

**Need to add audio?** → `src/game/audio.ts`  
**Need to add visual feedback?** → `src/game/feedback.ts`  
**Need to fix rendering?** → `src/game/renderer.ts`  
**Need to add particles?** → `src/game/particles.ts`  
**Need to balance gameplay?** → `src/game/engine.ts` (wave/spawn logic)  
**Need to change UI?** → `src/App.tsx`  
**Need to add styles?** → `src/index.css`  

---

## Quick Victory: 3-Hour Tasks

1. **Change game colors** (30 min) - Edit palettes in renderer.ts
2. **Add new sound** (1 hour) - Record/find audio, add to audio.ts
3. **Adjust difficulty** (30 min) - Tweak spawn rate, enemy health
4. **Fix a bug** (varies) - Use debugging tips above
5. **Add pause menu** (2 hours) - Follow feature example above

---

## Getting Help

**Error in console?**
1. Read the error message carefully
2. Look up that function in the code
3. Check parameters being passed
4. Add console.log() to debug

**Performance issues?**
1. Open DevTools Performance tab
2. Record gameplay for 30 seconds
3. Look for long frames (>16ms)
4. Find the bottleneck

**Gameplay feels off?**
1. Check values in engine.ts
2. Try adjusting spawn rate, damage, speed
3. Playtest changes immediately
4. Iterate

---

**Good luck, developer! 🎮**

May your frames be 60 and your bugs be few.

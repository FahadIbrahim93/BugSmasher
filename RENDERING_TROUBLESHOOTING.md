# Rendering & Gameplay Screen Troubleshooting Guide

## Issue: Blank Gameplay Screen with Audio Only

### Symptoms:
- Game enters 'playing' state (audio plays)
- Canvas appears blank/black
- Sound effects heard (firing, etc.) but no visuals
- Player and enemies not rendered

### Root Cause Analysis

The blank screen issue typically stems from one of these sources:

1. **Canvas Context Null** - Canvas 2D context fails to initialize
2. **Draw Function Not Called** - Game loop exists but render not executing
3. **CSS Display Issues** - Canvas hidden by styling
4. **Rendering Pipeline Breaks** - Error in draw() function prevents rendering
5. **Transform State Corruption** - Canvas transforms in invalid state

### Diagnostic Steps

#### Step 1: Check Browser Console
```javascript
// Open DevTools (F12) and run these commands:

// Check if canvas has context
const canvas = document.getElementById('game-canvas');
console.log('Canvas:', canvas);
console.log('Canvas context:', canvas.getContext('2d'));
console.log('Canvas size:', canvas.width, canvas.height);
console.log('Display:', getComputedStyle(canvas).display);
```

#### Step 2: Verify Game State
```javascript
// In console, check game state variables
console.log('Game state:', localStorage.getItem('gameState'));
console.log('Player position:', window.player?.x, window.player?.y);
console.log('Enemies:', window.enemies?.length || 0);
console.log('Canvas context alive:', window.ctx !== null);
```

#### Step 3: Check Canvas Dimensions
```javascript
// Verify canvas is properly sized
const canvas = document.getElementById('game-canvas');
console.log('Canvas width:', canvas.width);
console.log('Canvas height:', canvas.height);
console.log('Should be:', window.innerWidth, window.innerHeight);

// If not matching, window resize may have failed
window.dispatchEvent(new Event('resize'));
```

#### Step 4: Check for JavaScript Errors
```javascript
// Look for any errors in the console
// Common errors that cause blank screen:
// - "Cannot read property 'x' of undefined" (player object)
// - "ctx is null" or "ctx is not a context" (canvas context)
// - "ENEMY_TYPES.hornet is undefined" (fixed in engine.ts)
// - "Cannot render beetle" (renderer error)
```

### Fixed Issues

#### 1. ✓ Invalid Enemy Type References
**Issue**: Engine.ts referenced non-existent enemy types:
```javascript
// BEFORE (Line 301-303)
if (wave > 2 && Math.random() < 0.3) type = ENEMY_TYPES.hornet;    // ❌ undefined
if (wave > 4 && Math.random() < 0.2) type = ENEMY_TYPES.spider;    // ❌ undefined
if (wave > 6 && Math.random() < 0.1) type = ENEMY_TYPES.centipede; // ❌ undefined
```

**Fix**: Replaced with valid types:
```javascript
// AFTER (Line 301-305)
if (wave > 2 && Math.random() < 0.3) type = ENEMY_TYPES.wasp;
if (wave > 4 && Math.random() < 0.2) type = ENEMY_TYPES.moth;
if (wave > 6 && Math.random() < 0.15) type = ENEMY_TYPES.soldier;
if (wave > 8 && Math.random() < 0.15) type = ENEMY_TYPES.spitter;
if (wave > 10 && Math.random() < 0.1) type = ENEMY_TYPES.tank;
```

#### 2. ✓ HUD CSS Class Mismatch
**Issue**: JSX used class name 'show' but CSS defined 'active':
```jsx
// BEFORE
<div id="hud" className={gameState === 'playing' ? 'show' : ''}>
// CSS: #hud.active { opacity: 1; }  ❌ Never matched
```

**Fix**: Changed class name to match CSS:
```jsx
// AFTER
<div id="hud" className={gameState === 'playing' ? 'active' : ''}>
// CSS: #hud.active { opacity: 1; }  ✓ Now works
```

#### 3. ✓ Boss Spawn Type Reference
**Issue**: Boss spawning referenced undefined ENEMY_TYPES.mantis:
```javascript
// BEFORE (Line 332)
type: ENEMY_TYPES.mantis,  // ❌ undefined, causes error
```

**Fix**: Changed to valid boss types:
```javascript
// AFTER (Line 335-337)
const bossType = wave % 10 === 0 ? ENEMY_TYPES.voidQueen : ENEMY_TYPES.hiveMother;
type: bossType,  // ✓ Valid
```

---

## Detailed Rendering Pipeline

### Game Loop Flow
```
requestAnimationFrame(gameLoop)
  ├─ Calculate delta time (dt)
  ├─ if (isPlaying && ctx)
  │  ├─ update(dt)           // Update game state
  │  │  ├─ Update player position
  │  │  ├─ Update enemy AI
  │  │  ├─ Update projectiles
  │  │  └─ Spawn new enemies  ⚠️ Where invalid types caused crash
  │  │
  │  └─ draw(ctx)            // Render frame
  │     ├─ Clear canvas
  │     ├─ Draw grid
  │     ├─ Draw gems
  │     ├─ Draw enemies      ⚠️ Needs valid type.size, type.color
  │     ├─ Draw projectiles
  │     ├─ Draw particles
  │     ├─ Draw player
  │     ├─ Draw damage numbers
  │     └─ Draw minimap
  │
  └─ requestAnimationFrame(gameLoop)  // Next frame
```

### Known Rendering Issues & Fixes

#### Issue: Canvas Not Getting 2D Context
**File**: `src/game/engine.ts` line 57
```typescript
ctx = canvas.getContext('2d');  // Can return null if canvas invalid
if (!ctx) {
  console.error('[v0] Failed to initialize 2D context');
  return;
}
```

**Fix**: Add null check before using context
```typescript
export function initGame(canvas: HTMLCanvasElement, ...) {
  ctx = canvas.getContext('2d');
  if (!ctx) {
    console.error('[v0] Canvas 2D context initialization failed');
    return;
  }
  // ... rest of initialization
}
```

#### Issue: Canvas Display Property Not Applied
**File**: `src/App.tsx` line 436
```jsx
<canvas 
  style={{ 
    display: gameState === 'playing' ? 'block' : 'none' 
  }}
/>
```

**Verify**: Check that gameState is set to 'playing'
```javascript
// When clicking "ENGAGE" button (line 127):
setGameState('playing');  // This must be called

// Verify in browser:
const display = document.getElementById('game-canvas').style.display;
console.log('Canvas display:', display);  // Should be 'block'
```

#### Issue: Minimap Canvas Not Initializing
**File**: `src/game/engine.ts` line 58
```typescript
minimapCtx = minimap.getContext('2d');
if (!minimapCtx) {
  console.warn('[v0] Minimap context failed to initialize');
}
```

**Impact**: Minimap won't render but shouldn't break main game

#### Issue: Camera Transform Invalid
**File**: `src/game/engine.ts` line 482-491
```typescript
function draw(ctx: CanvasRenderingContext2D) {
  const camX = player.x - canvasWidth / 2;
  const camY = player.y - canvasHeight / 2;
  
  ctx.save();
  ctx.translate(-camX, -camY);  // ⚠️ If player undefined, NaN here
  // ...
  ctx.restore();
}
```

**Fix**: Validate player object before transform
```typescript
if (!player || player.x === undefined) {
  console.error('[v0] Player object invalid, skipping render');
  return;
}
```

---

## How to Test Rendering

### Quick Test Procedure
1. Open game in Chrome DevTools enabled
2. Click "PLAY AS GUEST" to skip auth
3. Select any hero class
4. Click "ENGAGE" to start game
5. **Expected**: See black game canvas with grid
6. **Check**: Canvas renders grid pattern, player sprite (beetle at center), and enemies

### Visual Validation Checklist
- [ ] Canvas is visible (not hidden)
- [ ] Background is black (#111)
- [ ] Grid pattern visible (gray lines)
- [ ] Player visible as green beetle at screen center
- [ ] Enemies spawn and visible as colored insects
- [ ] Projectiles visible as colored circles
- [ ] Particles spawn on hit/kill
- [ ] Minimap in bottom-right shows white player dot
- [ ] HUD visible in top-left/right (health, score, enemies)

### Debug Rendering Mode
Add these debug commands to engine.ts to visualize rendering:

```typescript
// In draw() function, after ctx.restore():
function draw(ctx: CanvasRenderingContext2D) {
  // ... normal render code ...
  
  // DEBUG: Draw render stats
  if (debugMode) {
    ctx.save();
    ctx.translate(0, 0);  // Back to screen space
    ctx.fillStyle = 'rgba(0,255,100,0.8)';
    ctx.font = '12px monospace';
    ctx.fillText(`FPS: ${Math.round(1/dt)}`, 10, 20);
    ctx.fillText(`Enemies: ${enemies.length}`, 10, 35);
    ctx.fillText(`Particles: ${particles.length}`, 10, 50);
    ctx.fillText(`Projectiles: ${projectiles.length}`, 10, 65);
    ctx.restore();
  }
}

// Toggle debug mode with:
// window.debugMode = true;  // in console
```

---

## Common Rendering Errors & Solutions

### Error: "Cannot read property 'type' of undefined"
**Cause**: Enemy object invalid in render loop
**Solution**: Add null check in draw loop
```typescript
// In draw(), line 524
for (const e of enemies) {
  if (!e || !e.type) continue;  // Skip invalid enemies
  InsectRenderer.drawBeetle(ctx, e.x, e.y, ...);
}
```

### Error: "Cannot read property 'size' of undefined"  
**Cause**: Enemy type object missing (which we fixed)
**Solution**: ✓ Already fixed by using valid ENEMY_TYPES

### Error: "RangeError: Invalid array length"
**Cause**: Canvas dimensions invalid
**Solution**: Verify canvas.width and canvas.height are positive
```typescript
if (canvas.width <= 0 || canvas.height <= 0) {
  console.error('[v0] Invalid canvas dimensions');
  resize();  // Force resize
}
```

### Issue: Choppy/Stuttering Rendering
**Cause**: Delta time calculation off
**Solution**: Reset lastTime on loss of focus
```typescript
window.addEventListener('blur', () => {
  lastTime = 0;  // Reset to prevent large dt spikes
});
```

---

## Performance Profiling

### Using Chrome DevTools
1. Open DevTools (F12)
2. Go to "Performance" tab
3. Click record button
4. Play game for 10 seconds
5. Stop recording
6. Analyze:
   - FPS should be ~60
   - No red "jank" bars
   - Game Loop frame time < 16.67ms

### Using Frame Timing API
```javascript
// Add to gameLoop function
const frameStart = performance.now();
// ... game update and render ...
const frameTime = performance.now() - frameStart;
if (frameTime > 16.67) {
  console.warn('[v0] Slow frame:', frameTime.toFixed(2) + 'ms');
}
```

---

## Verification Checklist After Fixes

- [x] Fixed invalid enemy type references
- [x] Fixed HUD CSS class mismatch  
- [x] Fixed boss spawn type reference
- [ ] Test game loads without errors
- [ ] Test canvas renders on first gameplay frame
- [ ] Test with 50 enemies on screen
- [ ] Test with 100 enemies on screen
- [ ] Verify FPS stays above 50
- [ ] Test all enemy types spawn correctly
- [ ] Test boss spawning at wave 5, 10, 15, etc.
- [ ] Verify minimap renders
- [ ] Verify HUD displays correctly
- [ ] Test on mobile (touch controls)
- [ ] Test on different browsers

---

## Next Steps

1. **Test Current Build**: Run `npm run dev` and verify rendering works
2. **Check Console**: Look for any lingering errors
3. **Performance Test**: Monitor FPS with 100+ enemies
4. **Visual Inspection**: Verify all game elements render correctly
5. **Browser Testing**: Test on Chrome, Firefox, Safari, Edge

If you continue to see blank screens, check the browser console for JavaScript errors and compare against the "Common Rendering Errors" section above.

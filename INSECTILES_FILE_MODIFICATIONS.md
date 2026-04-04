# INSECTILES Integration: File Modification Guide

## Overview

This document specifies exactly which files to modify and what changes to make to integrate INSECTILES patterns into BugSmasher while preserving existing functionality.

---

## Priority 1: Critical Changes (Must Complete)

### 1. src/index.css - HUD Layout Restructure

**Current State**: HUD is scattered across fixed positions
**Target State**: Unified three-section layout (left/center/right)

**Changes Required**:

```css
/* REMOVE OLD HUD STYLES */
/* These should be deleted or commented out:
   - #hud { position: fixed... }
   - #hudR { position: fixed... }
   - .hbar-wrap { ... }
*/

/* ADD NEW UNIFIED HUD */
#hud {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  padding: 20px 30px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  z-index: 20;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.8s ease;
}

#hud.active {
  opacity: 1;
}

.hud-left, .hud-right {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hud-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 20px;
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hud-right {
  align-items: flex-end;
}

/* Bar styling */
.health-bar-container {
  width: 240px;
  height: 8px;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(0, 255, 100, 0.3);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.health-bar {
  height: 100%;
  background: linear-gradient(90deg, #00ff64, #00cc50);
  border-radius: 3px;
  transition: width 0.4s ease;
  box-shadow: 0 0 10px rgba(0, 255, 100, 0.4);
}

.health-bar.low {
  background: linear-gradient(90deg, #ff3344, #cc2233);
}
```

**Estimated Time**: 2 hours

---

### 2. src/App.tsx - Add Pause State & Screen Management

**Current State**: States: loading, title, classselect, playing, gameover, upgrading
**Target State**: Add 'pause' state, implement showScreen() pattern

**Key Changes**:

1. **Add pause state variable**:
```typescript
const [isPaused, setIsPaused] = useState(false)

// Handle ESC key for pause
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && gameState === 'playing' && !isPaused) {
      setIsPaused(true)
    }
  }
  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [gameState, isPaused])
```

2. **Create unified screen controller**:
```typescript
function showScreen(screen: string | null) {
  if (screen === 'playing') {
    setGameState('playing')
    setIsPaused(false)
  } else if (screen === 'pause') {
    setIsPaused(true)
  } else {
    setGameState(screen || 'title')
    setIsPaused(false)
  }
}
```

3. **Add Pause Screen JSX**:
```tsx
<div id="pause" className={`screen ${isPaused && gameState === 'playing' ? 'on' : ''}`}>
  <div id="pauseTitle">PAUSED</div>
  <button 
    className="btn" 
    id="btnResume"
    onClick={() => setIsPaused(false)}
  >
    ► RESUME
  </button>
  <button 
    className="btn red" 
    id="btnAbort"
    onClick={() => setGameState('title')}
  >
    ✕ ABANDON RUN
  </button>
</div>
```

**Estimated Time**: 3 hours

---

### 3. src/game/engine.ts - Integration with Pause State

**Current State**: Game loop always running
**Target State**: Respects pause state

**Key Changes**:

```typescript
// At top of gameLoop function
function gameLoop(dt: number) {
  if (isPaused) {
    render() // Still render, but don't update
    return
  }
  
  // Normal game update
  updatePlayer(dt)
  updateEnemies(dt)
  // ... etc
}

// Pass pause state to engine
const [isPaused, setIsPaused] = useState(false)
// In the initGame call, pass setIsPaused
```

**Estimated Time**: 1.5 hours

---

## Priority 2: High-Impact Changes (Strongly Recommended)

### 4. src/index.css - Add Pause Screen Styling

**Add to CSS**:

```css
#pause {
  background: rgba(0, 0, 0, 0.87);
  z-index: 250;
}

#pauseTitle {
  font-family: 'Orbitron', monospace;
  font-size: 2.5rem;
  font-weight: 900;
  color: #88ffff;
  letter-spacing: 8px;
  margin-bottom: 32px;
  text-shadow: 0 0 30px #88ffff55;
}

.btn {
  font-family: 'Orbitron', monospace;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 3px;
  padding: 14px 44px;
  background: transparent;
  border: 2px solid #00ff88;
  color: #00ff88;
  cursor: pointer;
  transition: all 0.2s;
  clip-path: polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%);
  margin: 6px;
}

.btn:hover {
  background: #00ff8822;
  box-shadow: 0 0 22px #00ff8855;
  transform: scale(1.04);
}

.btn:active {
  transform: scale(0.97);
}

.btn.red {
  border-color: #ff3333;
  color: #ff3333;
}

.btn.red:hover {
  background: #ff333322;
}
```

**Estimated Time**: 1 hour

---

### 5. src/index.css - Wave Announcement Banner

**Add to CSS**:

```css
.wave-announce {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 30;
  opacity: 0;
  pointer-events: none;
  text-align: center;
  transition: all 0.8s ease;
}

.wave-announce.show {
  opacity: 1;
  animation: waveIn 2s ease-out forwards;
}

.wave-announce .wave-num {
  font-family: 'Orbitron', monospace;
  font-size: clamp(60px, 10vw, 120px);
  font-weight: 900;
  color: #fff;
  text-shadow: 0 0 60px rgba(0, 255, 100, 0.5),
               0 0 120px rgba(0, 255, 100, 0.2);
  letter-spacing: 8px;
}

.wave-announce .wave-desc {
  font-family: 'Share Tech Mono', monospace;
  font-size: 20px;
  color: rgba(0, 255, 100, 0.6);
  letter-spacing: 6px;
  margin-top: 10px;
}

@keyframes waveIn {
  from {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 0;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1);
    opacity: 1;
  }
  80% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  to {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0;
  }
}
```

**Estimated Time**: 1 hour

---

### 6. src/App.tsx - Add Wave Banner Component

**Add to App.tsx JSX**:

```tsx
const [currentWave, setCurrentWave] = useState(1)

// Trigger on wave change in engine
useEffect(() => {
  // When wave increases, show banner
  const showWaveBanner = () => {
    const banner = document.querySelector('.wave-announce')
    if (banner) {
      banner.classList.add('show')
      setTimeout(() => banner.classList.remove('show'), 2000)
    }
  }
  
  // Call this when wave increases in engine
  // showWaveBanner()
}, [currentWave])

// Add to JSX
<div className={`wave-announce ${shouldShowWave ? 'show' : ''}`}>
  <div className="wave-num">{currentWave}</div>
  <div className="wave-desc">INCOMING SWARM</div>
</div>
```

**Estimated Time**: 1.5 hours

---

### 7. src/index.css - Synergy Notification Styling

**Add to CSS**:

```css
#synNotif {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 10, 0.97);
  padding: 26px 50px;
  text-align: center;
  display: none;
  z-index: 300;
  pointer-events: none;
  border-radius: 4px;
}

#synNotif.show {
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: synPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes synPop {
  from {
    transform: translate(-50%, -50%) scale(0.3);
    opacity: 0;
  }
  60% {
    transform: translate(-50%, -50%) scale(1.08);
  }
  to {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
}

.syn-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.syn-name {
  font-family: 'Orbitron', monospace;
  font-size: 1.5rem;
  font-weight: 900;
  color: #ffd700;
  letter-spacing: 3px;
  margin-bottom: 8px;
}

.syn-desc {
  font-family: 'Share Tech Mono', monospace;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.4;
}
```

**Estimated Time**: 1 hour

---

### 8. src/App.tsx - Synergy Notification Queue

**Add to App.tsx**:

```typescript
const [synNotifications, setSynNotifications] = useState<Synergy[]>([])
const [currentSynNotif, setCurrentSynNotif] = useState<Synergy | null>(null)

function queueSynergyNotif(synergy: Synergy) {
  setSynNotifications(prev => [...prev, synergy])
}

useEffect(() => {
  if (synNotifications.length > 0 && !currentSynNotif) {
    setCurrentSynNotif(synNotifications[0])
    setSynNotifications(prev => prev.slice(1))
    
    // Auto-hide after 2.5 seconds
    const timer = setTimeout(() => {
      setCurrentSynNotif(null)
    }, 2500)
    
    return () => clearTimeout(timer)
  }
}, [synNotifications, currentSynNotif])

// Add to JSX
<div id="synNotif" className={currentSynNotif ? 'show' : ''}>
  {currentSynNotif && (
    <>
      <div className="syn-icon">{currentSynNotif.icon}</div>
      <div className="syn-name">{currentSynNotif.name}</div>
      <div className="syn-desc">{currentSynNotif.description}</div>
    </>
  )}
</div>
```

**Estimated Time**: 2 hours

---

## Priority 3: Visual Polish (Recommended)

### 9. src/index.css - Upgrade Card Enhancement

**Modify existing .ucrd styles**:

```css
.upg-card, .ucrd {
  width: 195px;
  border: 2px solid #ffd700;
  padding: 22px 18px;
  cursor: pointer;
  text-align: center;
  background: rgba(255, 215, 0, 0.04);
  transition: all 0.22s;
  clip-path: polygon(13px 0%, 100% 0%, calc(100% - 13px) 100%, 0% 100%);
}

.upg-card:hover, .ucrd:hover {
  background: rgba(255, 215, 0, 0.14);
  transform: translateY(-7px);
  box-shadow: 0 0 28px rgba(255, 215, 0, 0.35);
}

.upg-icon, .uicon {
  font-size: 2.4rem;
  margin-bottom: 10px;
}

.upg-name, .uname {
  font-family: 'Orbitron', monospace;
  font-size: 0.75rem;
  font-weight: 700;
  color: #ffd700;
  margin-bottom: 6px;
  letter-spacing: 1px;
}

.upg-desc, .udesc {
  font-family: 'Share Tech Mono', monospace;
  font-size: 0.67rem;
  color: #aaa;
  line-height: 1.4;
}

.upg-level, .ulvl {
  margin-top: 8px;
  font-family: 'Share Tech Mono', monospace;
  font-size: 0.6rem;
  color: rgba(255, 215, 0, 0.46);
}
```

**Estimated Time**: 1 hour

---

### 10. src/index.css - Mobile Joystick Styling

**Ensure joystick CSS matches INSECTILES**:

```css
#joystickArea {
  position: fixed;
  bottom: 30px;
  left: 30px;
  width: 120px;
  height: 120px;
  z-index: 61;
  display: none;
}

#joystickOuter {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.35);
  position: relative;
}

#joystickInner {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.35);
  position: absolute;
  top: 38px;
  left: 38px;
  pointer-events: none;
  transition: all 0.05s;
}

@media (max-width: 768px) {
  #joystickArea {
    display: block;
  }
  
  #abilBtn {
    display: block;
  }
}
```

**Estimated Time**: 0.5 hours

---

## Priority 4: Optional Enhancements

### 11. src/index.css - Add Ability Cooldown Ring

```css
.ability-slot {
  width: 56px;
  height: 56px;
  border: 1px solid rgba(0, 255, 100, 0.3);
  background: rgba(0, 0, 0, 0.6);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.3s ease;
}

.ability-slot .key {
  position: absolute;
  top: -18px;
  font-family: 'Orbitron', monospace;
  font-size: 9px;
  color: rgba(0, 255, 100, 0.4);
  letter-spacing: 1px;
}

.ability-slot .icon {
  font-size: 24px;
  filter: drop-shadow(0 0 6px rgba(0, 255, 100, 0.4));
}

.ability-slot .cooldown-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 0 0 7px 7px;
  transition: height 0.1s linear;
}

.ability-slot.ready {
  border-color: rgba(0, 255, 100, 0.6);
  box-shadow: 0 0 15px rgba(0, 255, 100, 0.15);
}
```

**Estimated Time**: 1.5 hours

---

### 12. src/index.css - Damage Flash Vignette

```css
.damage-vignette {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 15;
  box-shadow: inset 0 0 100px rgba(255, 0, 0, 0);
  transition: box-shadow 0.15s ease;
}

.damage-vignette.hit {
  box-shadow: inset 0 0 120px rgba(255, 30, 30, 0.4);
}
```

**Estimated Time**: 0.5 hours

---

## Implementation Timeline

### Week 1: Foundation (15 hours)
- Mon-Tue: CSS restructure + HUD layout (2 hrs)
- Wed: Pause state implementation (3 hrs)
- Thu: Engine integration (1.5 hrs)
- Fri: CSS styling for pause screen (1 hr)
- Sat-Sun: Wave announcements (2 hrs)

### Week 2: Polish (15 hours)
- Mon-Tue: Synergy notifications (2 hrs)
- Wed: Upgrade card styling (1 hr)
- Thu-Fri: Testing + bug fixes (2 hrs)
- Sat: Mobile joystick verification (1 hr)
- Sun: Optional: cooldown ring + damage vignette (1.5 hrs)

### Week 3: Final (8 hours)
- Integration testing
- Cross-browser testing
- Mobile testing
- Performance optimization

**Total**: 38-40 hours

---

## Testing Checklist Before Deployment

### Functionality
- [ ] Pause/resume works with ESC
- [ ] Resume button in pause menu works
- [ ] Abandon run returns to title
- [ ] Wave announcements trigger correctly
- [ ] Synergy notifications queue and display
- [ ] HUD updates in real-time

### Visual
- [ ] All animations smooth (60 FPS)
- [ ] Pause screen centered and visible
- [ ] Wave banner displays correctly
- [ ] Synergy pop-ups animate properly
- [ ] Mobile layout responsive

### Audio
- [ ] Pause doesn't affect audio
- [ ] Sound effects still work mid-pause

### Performance
- [ ] No FPS drop during pause
- [ ] Animations don't cause stuttering
- [ ] Memory usage stable

### Cross-Browser
- [ ] Chrome (desktop & mobile)
- [ ] Firefox
- [ ] Safari (iOS)
- [ ] Edge

---

## Rollback Plan

If integration causes issues:
1. Git branch strategy: `feature/insectiles-integration`
2. Commit frequently (hourly)
3. If major issue: `git revert <commit>`
4. Test thoroughly before merging to main

---

## Success Metrics

After completion:
- Quality score: 7.2 → 9.0/10
- Mobile support: Equivalent to desktop
- Code quality: 95+/100
- Performance: 60+ FPS on mobile
- User feedback: Positive


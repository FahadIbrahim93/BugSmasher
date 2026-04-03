import { useState, useEffect, useRef, useCallback } from 'react';
import {
  initGame,
  startGame,
  getPlayerState,
  resumeGame,
  setAutoAttack as setEngineAutoAttack,
  purchaseUpgrade,
  getAvailableUpgrades,
  getUpgradeState,
  getAchievementToasts,
  getSynergyToasts,
  getEnemyCount,
  getKillCount,
  getRunStats,
} from './game/engine';
import { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged } from './firebase';
import { loadUserData, saveUserData, userData } from './store';
import { HERO_CLASSES, HeroClass } from './game/player';
import { UPGRADE_DEFS, SYNERGY_DEFS } from './game/upgrades';
import { getDailySeed } from './game/utils';

type GameScreen = 'loading' | 'title' | 'classselect' | 'playing' | 'gameover' | 'upgrading';

interface PlayerHUD {
  hp: number;
  maxHp: number;
  xp: number;
  maxXp: number;
  level: number;
  upgradePoints: number;
  combo: number;
  maxCombo: number;
  score: number;
  wave: number;
  totalKills: number;
  fps: number;
  abilities: Array<{ name: string; cooldown: number; maxCooldown: number }>;
  activeSynergies: string[];
  discoveredSynergies: string[];
  playerUpgrades: Record<string, number>;
}

interface Toast {
  id: string;
  name: string;
  icon: string;
  life: number;
  tier?: string;
  desc?: string;
  type: 'achievement' | 'synergy';
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const minimapRef = useRef<HTMLCanvasElement>(null);
  const hudRef = useRef<PlayerHUD>({
    hp: 100,
    maxHp: 100,
    xp: 0,
    maxXp: 100,
    level: 1,
    upgradePoints: 0,
    combo: 0,
    maxCombo: 0,
    score: 0,
    wave: 1,
    totalKills: 0,
    fps: 0,
    abilities: [],
    activeSynergies: [],
    discoveredSynergies: [],
    playerUpgrades: {},
  });

  const [user, setUser] = useState<{ uid: string; displayName?: string } | null>(null);
  const [gameState, setGameState] = useState<GameScreen>('loading');
  const [selectedClass, setSelectedClass] = useState<HeroClass>(HERO_CLASSES[0]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [autoAttack, setAutoAttack] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  const [showCodex, setShowCodex] = useState(false);
  const [showA11y, setShowA11y] = useState(false);
  const [cbMode, setCbMode] = useState('normal');
  const [upgradePoints, setUpgradePoints] = useState(0);
  const [availableUpgrades, setAvailableUpgrades] = useState<
    Array<{ upgrade: (typeof UPGRADE_DEFS)[0]; level: number; cost: number }>
  >([]);
  const [activeSynergies, setActiveSynergies] = useState<string[]>([]);
  const [discoveredSynergies, setDiscoveredSynergies] = useState<string[]>([]);
  const [playerUpgrades, setPlayerUpgrades] = useState<Record<string, number>>({});
  const [rerollCost, setRerollCost] = useState(50);
  const [finalScore, setFinalScore] = useState(0);
  const [finalWave, setFinalWave] = useState(1);
  const [waveAnnounce, setWaveAnnounce] = useState<{ wave: number; desc: string } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await loadUserData(currentUser.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (canvasRef.current && minimapRef.current) {
      initGame(
        canvasRef.current,
        minimapRef.current,
        async (fScore, fWave) => {
          setFinalScore(fScore);
          setFinalWave(fWave);
          setGameState('gameover');
          if (user) {
            if (fScore > (userData.bestScore || 0)) {
              userData.bestScore = fScore;
              userData.bestWave = Math.max(userData.bestWave || 0, fWave);
              await saveUserData(user.uid);
            }
          }
        },
        () => {},
        () => {
          const upgrades = getAvailableUpgrades();
          setAvailableUpgrades(upgrades);
          const us = getUpgradeState();
          setUpgradePoints(us.upgradePoints);
          setActiveSynergies(us.activeSynergies);
          setDiscoveredSynergies(us.discoveredSynergies);
          setPlayerUpgrades(us.playerUpgrades);
          setRerollCost(us.rerollCost);
          setGameState('upgrading');
        },
        (newWave) => {
          setWaveAnnounce({
            wave: newWave,
            desc: newWave % 5 === 0 ? 'APEX PREDATOR DETECTED' : 'THE SWARM GROWS',
          });
          setTimeout(() => setWaveAnnounce(null), 3000);
        },
        () => {},
        () => {},
        () => {}
      );
      setGameState('title');
    }
  }, []);

  useEffect(() => {
    setEngineAutoAttack(autoAttack);
  }, [autoAttack]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        setAutoAttack((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    const updateHUD = () => {
      if (gameState === 'playing') {
        const pState = getPlayerState();
        hudRef.current = pState;
        setUpgradePoints(pState.upgradePoints);
        setActiveSynergies(pState.activeSynergies);
        setDiscoveredSynergies(pState.discoveredSynergies);
        setPlayerUpgrades(pState.playerUpgrades);

        const achToasts = getAchievementToasts();
        const synToasts = getSynergyToasts();
        if (achToasts.length > 0 || synToasts.length > 0) {
          setToasts((prev) => {
            const existing = new Set(prev.map((t) => t.id));
            const newToasts: Toast[] = [];
            for (const t of achToasts) {
              if (!existing.has(t.id)) {
                newToasts.push({ ...t, type: 'achievement' });
              }
            }
            for (const t of synToasts) {
              if (!existing.has(t.id)) {
                newToasts.push({ ...t, type: 'synergy' });
              }
            }
            return newToasts.length > 0 ? [...prev, ...newToasts] : prev;
          });
        }
      }
      animationFrameId = requestAnimationFrame(updateHUD);
    };
    if (gameState === 'playing' || gameState === 'upgrading') {
      updateHUD();
    }
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState]);

  useEffect(() => {
    const interval = setInterval(() => {
      setToasts((prev) =>
        prev.filter((t) => t.life > 0).map((t) => ({ ...t, life: t.life - 0.1 }))
      );
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch {
      console.error('Login failed');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch {
      console.error('Logout failed');
    }
  };

  const handleStartGame = () => {
    setGameState('playing');
    startGame(selectedClass);
  };

  const handleSelectUpgrade = useCallback((upgradeId: string) => {
    const success = purchaseUpgrade(upgradeId);
    if (success) {
      const us = getUpgradeState();
      setUpgradePoints(us.upgradePoints);
      setActiveSynergies(us.activeSynergies);
      setDiscoveredSynergies(us.discoveredSynergies);
      setPlayerUpgrades(us.playerUpgrades);
      setRerollCost(us.rerollCost);
      const upgrades = getAvailableUpgrades();
      setAvailableUpgrades(upgrades);
    }
  }, []);

  const handleReroll = useCallback(() => {
    const us = getUpgradeState();
    if (us.upgradePoints >= us.rerollCost) {
      setUpgradePoints((prev) => prev - us.rerollCost);
      const upgrades = getAvailableUpgrades();
      setAvailableUpgrades(upgrades);
    }
  }, []);

  const handleContinue = useCallback(() => {
    setGameState('playing');
    resumeGame();
  }, []);

  const handleTouchJoystick = useCallback(() => {
    const joystickZone = document.getElementById('touch-joystick-zone');
    const joystickBase = document.getElementById('joystick-base');
    const joystickThumb = document.getElementById('joystick-thumb');
    const fireZone = document.getElementById('touch-fire-zone');
    const fireBtn = document.getElementById('touch-fire-btn');

    if (!joystickZone || !joystickBase || !joystickThumb || !fireZone || !fireBtn) return;

    let touchId: number | null = null;
    let fireTouchId: number | null = null;
    let basePos = { x: 0, y: 0 };

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.clientX < window.innerWidth / 2 && touchId === null) {
          touchId = t.identifier;
          basePos = { x: t.clientX, y: t.clientY };
          joystickBase.style.left = `${basePos.x - 50}px`;
          joystickBase.style.top = `${basePos.y - 50}px`;
          joystickThumb.style.left = `${basePos.x - 25}px`;
          joystickThumb.style.top = `${basePos.y - 25}px`;
          joystickBase.style.display = 'block';
          joystickThumb.style.display = 'block';
        } else if (t.clientX >= window.innerWidth / 2 && fireTouchId === null) {
          fireTouchId = t.identifier;
          fireBtn.style.transform = 'scale(0.9)';
          fireBtn.style.background = 'rgba(255, 255, 255, 0.4)';
          const canvas = canvasRef.current;
          if (canvas) canvas.dispatchEvent(new MouseEvent('mousedown'));
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === touchId) {
          const dx = t.clientX - basePos.x;
          const dy = t.clientY - basePos.y;
          const dist = Math.min(Math.hypot(dx, dy), 50);
          const angle = Math.atan2(dy, dx);
          joystickThumb.style.left = `${basePos.x + Math.cos(angle) * dist - 25}px`;
          joystickThumb.style.top = `${basePos.y + Math.sin(angle) * dist - 25}px`;

          const eventUp = new KeyboardEvent('keyup', { key: 'w' });
          const eventDown = new KeyboardEvent('keyup', { key: 's' });
          const eventLeft = new KeyboardEvent('keyup', { key: 'a' });
          const eventRight = new KeyboardEvent('keyup', { key: 'd' });
          window.dispatchEvent(eventUp);
          window.dispatchEvent(eventDown);
          window.dispatchEvent(eventLeft);
          window.dispatchEvent(eventRight);

          if (dist > 10) {
            if (Math.abs(dx) > Math.abs(dy)) {
              if (dx > 0) window.dispatchEvent(new KeyboardEvent('keydown', { key: 'd' }));
              else window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
            } else {
              if (dy > 0) window.dispatchEvent(new KeyboardEvent('keydown', { key: 's' }));
              else window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }));
            }
          }
        } else if (t.identifier === fireTouchId) {
          const canvas = canvasRef.current;
          if (canvas) {
            canvas.dispatchEvent(
              new MouseEvent('mousemove', {
                clientX: t.clientX,
                clientY: t.clientY,
              })
            );
          }
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === touchId) {
          touchId = null;
          joystickBase.style.display = 'none';
          joystickThumb.style.display = 'none';
          window.dispatchEvent(new KeyboardEvent('keyup', { key: 'w' }));
          window.dispatchEvent(new KeyboardEvent('keyup', { key: 's' }));
          window.dispatchEvent(new KeyboardEvent('keyup', { key: 'a' }));
          window.dispatchEvent(new KeyboardEvent('keyup', { key: 'd' }));
        } else if (t.identifier === fireTouchId) {
          fireTouchId = null;
          fireBtn.style.transform = 'scale(1)';
          fireBtn.style.background = 'rgba(255, 255, 255, 0.2)';
          const canvas = canvasRef.current;
          if (canvas) canvas.dispatchEvent(new MouseEvent('mouseup'));
        }
      }
    };

    joystickZone.addEventListener('touchstart', handleTouchStart, { passive: false });
    joystickZone.addEventListener('touchmove', handleTouchMove, { passive: false });
    joystickZone.addEventListener('touchend', handleTouchEnd, { passive: false });
    joystickZone.addEventListener('touchcancel', handleTouchEnd, { passive: false });
    fireZone.addEventListener('touchstart', handleTouchStart, { passive: false });
    fireZone.addEventListener('touchmove', handleTouchMove, { passive: false });
    fireZone.addEventListener('touchend', handleTouchEnd, { passive: false });
    fireZone.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    const abBtns = document.querySelectorAll('.touch-ab-btn');
    const handleAbTouch = (e: Event) => {
      e.preventDefault();
      const btn = e.currentTarget as HTMLElement;
      const abIndex = btn.getAttribute('data-ab');
      let key = '';
      if (abIndex === '0') key = 'q';
      if (abIndex === '1') key = 'w';
      if (abIndex === '2') key = 'e';
      if (abIndex === '3') key = 'r';
      if (key) {
        window.dispatchEvent(new KeyboardEvent('keydown', { key }));
        setTimeout(() => window.dispatchEvent(new KeyboardEvent('keyup', { key })), 100);
      }
    };
    abBtns.forEach((btn) => btn.addEventListener('touchstart', handleAbTouch, { passive: false }));

    return () => {
      joystickZone.removeEventListener('touchstart', handleTouchStart);
      joystickZone.removeEventListener('touchmove', handleTouchMove);
      joystickZone.removeEventListener('touchend', handleTouchEnd);
      joystickZone.removeEventListener('touchcancel', handleTouchEnd);
      fireZone.removeEventListener('touchstart', handleTouchStart);
      fireZone.removeEventListener('touchmove', handleTouchMove);
      fireZone.removeEventListener('touchend', handleTouchEnd);
      fireZone.removeEventListener('touchcancel', handleTouchEnd);
      abBtns.forEach((btn) => btn.removeEventListener('touchstart', handleAbTouch));
    };
  }, []);

  useEffect(() => {
    if (gameState !== 'playing') return;
    const cleanup = handleTouchJoystick();
    return cleanup;
  }, [gameState, handleTouchJoystick]);

  useEffect(() => {
    document.body.className = cbMode !== 'normal' ? `cb-${cbMode}` : '';
  }, [cbMode]);

  const hp = hudRef.current.hp;
  const maxHp = hudRef.current.maxHp;
  const xp = hudRef.current.xp;
  const maxXp = hudRef.current.maxXp;
  const level = hudRef.current.level;
  const combo = hudRef.current.combo;
  const score = hudRef.current.score;
  const wave = hudRef.current.wave;
  const totalKills = hudRef.current.totalKills;
  const enemyCount = getEnemyCount();
  const fps = hudRef.current.fps;
  const abilities = hudRef.current.abilities;
  const dailySeed = getDailySeed();

  return (
    <>
      {gameState === 'loading' && (
        <div id="loader" role="status" aria-live="polite" aria-label="Loading game systems">
          <div
            className="load-bar"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={0}
          >
            <div className="load-fill" id="load-fill" style={{ width: '100%' }}></div>
          </div>
          <div className="load-text">INITIALIZING SYSTEMS</div>
        </div>
      )}

      <div
        id="title-screen"
        className={gameState !== 'title' ? 'hidden' : ''}
        role="main"
        aria-label="Title screen"
      >
        <div className="title-glow" aria-hidden="true"></div>
        <div className="title-text" aria-label="Insectiles">
          INSECTILES
        </div>
        <div className="title-sub">Survive the Swarm</div>

        <div
          id="auth-section"
          style={{
            marginTop: '40px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 2,
          }}
        >
          {!user ? (
            <button
              className="start-btn"
              id="login-btn"
              aria-label="Login with Google"
              style={{ marginTop: 0 }}
              onClick={handleLogin}
            >
              LOGIN WITH GOOGLE
            </button>
          ) : (
            <div
              id="user-info"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div
                style={{
                  color: 'rgba(0,255,100,0.8)',
                  fontFamily: "'Orbitron', monospace",
                  fontSize: '14px',
                  letterSpacing: '2px',
                }}
              >
                WELCOME, {user.displayName?.toUpperCase()}
              </div>
              <button
                className="start-btn"
                id="start-btn"
                aria-label="Start game and choose class"
                style={{ marginTop: '10px' }}
                onClick={() => setGameState('classselect')}
              >
                ENGAGE
              </button>
              <button
                id="logout-btn"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255,100,100,0.8)',
                  fontFamily: "'Orbitron', monospace",
                  fontSize: '10px',
                  cursor: 'pointer',
                  letterSpacing: '2px',
                  textDecoration: 'underline',
                  marginTop: '10px',
                }}
                onClick={handleLogout}
              >
                LOGOUT
              </button>
            </div>
          )}
        </div>

        <div className="version-tag" aria-label="Version info">
          APEX SWARM EDITION v5.0 — PRODUCTION BUILD
        </div>
      </div>

      <div
        id="class-select"
        className={gameState === 'classselect' ? 'show' : ''}
        role="dialog"
        aria-modal="true"
        aria-label="Choose your hero class"
      >
        <div className="cs-title">CHOOSE YOUR FORM</div>
        <div className="cs-sub">YOUR LINEAGE SHAPES YOUR DESTINY</div>
        <div className="cs-grid" role="radiogroup" aria-label="Hero classes">
          {HERO_CLASSES.map((cls) => (
            <div
              key={cls.id}
              className={`cs-card ${cls.id === selectedClass.id ? 'selected' : ''}`}
              style={{
                borderColor: cls.id === selectedClass.id ? cls.color : '',
                boxShadow: cls.id === selectedClass.id ? `0 0 25px ${cls.color}33` : '',
              }}
              onClick={() => setSelectedClass(cls)}
            >
              <span className="cs-emoji">{cls.emoji}</span>
              <div className="cs-name" style={{ color: cls.color }}>
                {cls.name}
              </div>
              <div className="cs-role">{cls.role}</div>
              <div className="cs-lore">{cls.lore}</div>
              <div className="cs-stats">
                <div className="cs-stat-row">
                  <span style={{ width: '60px' }}>SPD</span>
                  <div className="cs-stat-bar">
                    <div
                      className="cs-stat-fill"
                      style={{ width: `${cls.statLabels.speed}%`, background: cls.color }}
                    ></div>
                  </div>
                </div>
                <div className="cs-stat-row">
                  <span style={{ width: '60px' }}>VIT</span>
                  <div className="cs-stat-bar">
                    <div
                      className="cs-stat-fill"
                      style={{ width: `${cls.statLabels.health}%`, background: cls.color }}
                    ></div>
                  </div>
                </div>
                <div className="cs-stat-row">
                  <span style={{ width: '60px' }}>ATK</span>
                  <div className="cs-stat-bar">
                    <div
                      className="cs-stat-fill"
                      style={{ width: `${cls.statLabels.damage}%`, background: cls.color }}
                    ></div>
                  </div>
                </div>
                <div className="cs-stat-row">
                  <span style={{ width: '60px' }}>RANGE</span>
                  <div className="cs-stat-bar">
                    <div
                      className="cs-stat-fill"
                      style={{ width: `${cls.statLabels.range}%`, background: cls.color }}
                    ></div>
                  </div>
                </div>
              </div>
              <div
                style={{
                  marginTop: '10px',
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: '11px',
                  color: cls.color,
                  opacity: 0.7,
                }}
              >
                ✦ {cls.passive}
              </div>
            </div>
          ))}
        </div>
        <button className="cs-start-btn" onClick={handleStartGame}>
          ENTER THE SWARM
        </button>
      </div>

      <div
        id="game-over"
        className={gameState === 'gameover' ? 'show' : ''}
        role="dialog"
        aria-modal="true"
        aria-label="Game Over"
      >
        <div className="go-title">SWARM OVERWHELM</div>
        <div className="go-stats">
          <div>
            FINAL SCORE: <span style={{ color: 'var(--c-accent)' }}>{finalScore}</span>
          </div>
          <div>
            WAVES SURVIVED: <span style={{ color: 'var(--c-accent)' }}>{finalWave}</span>
          </div>
          {user && userData && (
            <div style={{ marginTop: '10px', fontSize: '14px', color: '#888' }}>
              HIGH SCORE: {userData.bestScore || 0} (WAVE {userData.bestWave || 0})
            </div>
          )}
        </div>
        <button className="start-btn" onClick={() => setGameState('title')}>
          RETURN TO NEST
        </button>
      </div>

      <canvas
        id="game-canvas"
        ref={canvasRef}
        role="img"
        aria-label="Game world"
        style={{
          display:
            gameState === 'playing' || gameState === 'gameover' || gameState === 'upgrading'
              ? 'block'
              : 'none',
        }}
      ></canvas>

      <div
        id="hud"
        className={gameState === 'playing' ? 'show' : ''}
        role="region"
        aria-label="Game HUD"
        aria-live="polite"
      >
        <div className="hud-left">
          <div className="hud-label" id="vitality-label">
            VITALITY
          </div>
          <div
            className="health-bar-container"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={(hp / maxHp) * 100}
          >
            <div
              className={`health-bar ${hp / maxHp < 0.25 ? 'low' : ''}`}
              style={{ width: `${Math.max(0, (hp / maxHp) * 100)}%` }}
            ></div>
          </div>
          <div className="hud-label" style={{ marginTop: '8px' }}>
            SCORE
          </div>
          <div className="hud-value" aria-label={`Score: ${score}`}>
            {score}
          </div>
          <div className="hud-label" style={{ marginTop: '8px' }}>
            LEVEL
          </div>
          <div className="hud-value" aria-label={`Level: ${level}`}>
            {level}
          </div>
          <div className="hud-label" style={{ marginTop: '8px' }}>
            XP
          </div>
          <div className="hud-value" aria-label={`XP: ${xp}/${maxXp}`}>
            {Math.floor(xp)}/{maxXp}
          </div>
        </div>
        <div className="hud-center">
          <div className="wave-title" aria-label="Current wave">
            WAVE {wave}
          </div>
          <div
            className={`combo-display ${combo > 1 ? 'active' : ''}`}
            aria-label="Combo multiplier"
          >
            {combo > 1 ? `x${combo}` : ''}
          </div>
        </div>
        <div className="hud-right">
          <div className="hud-label">ENEMIES</div>
          <div className="hud-value" aria-label="Remaining enemies">
            {enemyCount}
          </div>
          <div className="hud-label" style={{ marginTop: '8px' }}>
            KILLS
          </div>
          <div className="hud-value" style={{ fontSize: '20px' }} aria-label="Total kills">
            {totalKills}
          </div>
        </div>
      </div>

      <div
        className={`ability-bar ${gameState === 'playing' ? 'show' : ''}`}
        id="ability-bar"
        role="toolbar"
        aria-label="Abilities"
      >
        {abilities.map((ab, idx) => {
          const keys = ['Q', 'W', 'E', 'R'];
          const icons = ['🔥', '⚡', '🛡️', '💀'];
          const isReady = ab.cooldown <= 0;
          const cdPercent = isReady ? 0 : (ab.cooldown / ab.maxCooldown) * 100;
          return (
            <div
              key={idx}
              className={`ability-slot ${isReady ? 'ready' : ''}`}
              role="button"
              aria-label={`Ability ${idx + 1}: ${ab.name} (${keys[idx]})`}
              tabIndex={-1}
            >
              <span className="key" aria-hidden="true">
                {keys[idx]}
              </span>
              <span className="icon" aria-hidden="true">
                {icons[idx]}
              </span>
              <div
                className="cooldown-overlay"
                style={{ height: `${cdPercent}%` }}
                aria-hidden="true"
              ></div>
            </div>
          );
        })}
      </div>

      {waveAnnounce && (
        <div className="wave-announce show" role="alert" aria-live="assertive">
          <div className="wave-num">WAVE {waveAnnounce.wave}</div>
          <div className="wave-desc">{waveAnnounce.desc}</div>
        </div>
      )}

      <div className="damage-vignette" id="damage-vignette" aria-hidden="true"></div>

      <div
        id="synergy-bar"
        role="region"
        aria-label="Active synergies"
        aria-live="polite"
        style={{
          display: activeSynergies.length > 0 ? 'flex' : 'none',
          opacity: activeSynergies.length > 0 ? 1 : 0,
        }}
      >
        {activeSynergies.map((synId) => {
          const syn = SYNERGY_DEFS.find((s) => s.id === synId);
          if (!syn) return null;
          return (
            <div key={synId} className={`synergy-badge tier-${syn.tier}`}>
              <div className="syn-glow"></div>
              <span className="syn-icon">{syn.icon}</span>
              <span className="syn-name">{syn.name}</span>
              <div className="syn-desc">{syn.desc}</div>
            </div>
          );
        })}
      </div>

      <div
        id="threat-meter"
        role="status"
        aria-label="Threat level indicator"
        style={{ display: gameState === 'playing' ? 'flex' : 'none' }}
      >
        <div className="threat-label">THREAT LEVEL</div>
        <div
          className="threat-bar-wrap"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.min(100, wave * 4)}
        >
          <div
            className="threat-fill"
            style={{
              width: `${Math.min(100, wave * 4)}%`,
              background: wave > 10 ? '#ff3344' : wave > 5 ? '#ffaa00' : '#00ff64',
            }}
          ></div>
        </div>
        <div className="threat-label-val" aria-live="polite">
          {wave > 15 ? 'CRITICAL' : wave > 10 ? 'HIGH' : wave > 5 ? 'ELEVATED' : 'CALM'}
        </div>
      </div>

      <div
        id="auto-indicator"
        aria-live="polite"
        aria-label="Auto-attack status"
        className={autoAttack ? 'active on' : 'active'}
        style={{ display: gameState === 'playing' ? 'block' : 'none' }}
      >
        [ TAB ] AUTO: {autoAttack ? 'ON' : 'OFF'}
      </div>

      <div
        id="daily-badge"
        className="active"
        aria-label="Daily seed run indicator"
        style={{ display: gameState === 'playing' ? 'block' : 'none' }}
      >
        <div className="daily-inner">
          <span className="daily-icon" aria-hidden="true">
            👑
          </span>
          <span className="daily-label">DAILY #{dailySeed}</span>
        </div>
      </div>

      <button
        id="journal-btn"
        aria-expanded={showJournal}
        aria-controls="journal-panel"
        aria-label="Toggle hive journal"
        style={{ display: gameState === 'playing' ? 'block' : 'none' }}
        onClick={() => setShowJournal(!showJournal)}
      >
        📖 HIVE LOG
      </button>

      {showJournal && (
        <div id="journal-panel" role="region" aria-label="Hive journal panel" className="open">
          <div className="jp-title">⬡ HIVE JOURNAL</div>
          <div className="jp-entry">
            <span>Score</span>
            <span className="jp-val">{score}</span>
          </div>
          <div className="jp-entry">
            <span>Wave</span>
            <span className="jp-val">{wave}</span>
          </div>
          <div className="jp-entry">
            <span>Level</span>
            <span className="jp-val">{level}</span>
          </div>
          <div className="jp-entry">
            <span>Kills</span>
            <span className="jp-val">{totalKills}</span>
          </div>
          <div className="jp-entry">
            <span>Max Combo</span>
            <span className="jp-val">x{hudRef.current.maxCombo}</span>
          </div>
          <div className="jp-entry">
            <span>Upgrades</span>
            <span className="jp-val">{Object.keys(playerUpgrades).length}</span>
          </div>
          <div className="jp-entry">
            <span>Synergies</span>
            <span className="jp-val">{activeSynergies.length}</span>
          </div>
          {user && userData && (
            <>
              <div className="jp-entry best">
                <span>Best Score</span>
                <span className="jp-val">{userData.bestScore || 0}</span>
              </div>
              <div className="jp-entry best">
                <span>Best Wave</span>
                <span className="jp-val">{userData.bestWave || 0}</span>
              </div>
            </>
          )}
          <div className="jp-ach">
            <div className="jp-ach-title">ACHIEVEMENTS</div>
            {(userData?.achievements || []).map((a: string) => (
              <span key={a} className="jp-badge">
                {a}
              </span>
            ))}
          </div>
        </div>
      )}

      <div
        id="upgrade-screen"
        className={gameState === 'upgrading' ? 'show' : ''}
        role="dialog"
        aria-modal="true"
        aria-label="Upgrade selection screen"
      >
        <div className="upgrade-header">EVOLVE</div>
        <div className="upgrade-subheader">CHOOSE AN ADAPTATION</div>
        <div className="upgrade-points" aria-live="polite" aria-label="Available upgrade points">
          {upgradePoints} PTS
        </div>
        <div className="upgrade-grid" role="list" aria-label="Available upgrades">
          {availableUpgrades.map(({ upgrade, level, cost }, i) => {
            const canAfford = upgradePoints >= cost;
            const isMaxed = level >= upgrade.maxLevel;
            return (
              <div
                key={i}
                className={`upgrade-card rarity-${upgrade.rarity} card-enter ${isMaxed ? 'maxed' : ''} ${!canAfford ? 'cant-afford' : ''}`}
                onClick={() => handleSelectUpgrade(upgrade.id)}
              >
                <div className="uc-rarity">{upgrade.rarity}</div>
                <div className="uc-icon">{upgrade.icon}</div>
                <div className="uc-content">
                  <div className="uc-name">{upgrade.name}</div>
                  <div className="uc-desc">{upgrade.desc}</div>
                </div>
                <div className="uc-level">
                  LVL {level}/{upgrade.maxLevel}
                </div>
                <div className="uc-cost">{cost} PTS</div>
                <div className="uc-pips">
                  {Array.from({ length: upgrade.maxLevel }).map((_, pi) => (
                    <div key={pi} className={`uc-pip ${pi < level ? 'filled' : ''}`}></div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div className="upgrade-actions">
          <button
            className={`reroll-btn ${upgradePoints < rerollCost ? 'cant-afford' : ''}`}
            onClick={handleReroll}
            aria-label="Reroll upgrade options"
          >
            <span className="reroll-spin" aria-hidden="true">
              ⟳
            </span>{' '}
            REROLL
            <span>{rerollCost}</span> PTS
          </button>
          <button
            id="codex-toggle"
            aria-expanded={showCodex}
            aria-controls="codex-panel"
            aria-label="Toggle synergy codex"
            onClick={() => setShowCodex(!showCodex)}
          >
            ✦ SYNERGY CODEX{' '}
            <span className="codex-badge">
              {discoveredSynergies.length} / {SYNERGY_DEFS.length}
            </span>
          </button>
          {showCodex && (
            <div id="codex-panel" role="region" aria-label="Synergy codex" className="open">
              <div className="codex-inner">
                <div className="codex-title">⬡ HIVE KNOWLEDGE</div>
                <div className="codex-grid" role="list" aria-label="Known synergies">
                  {SYNERGY_DEFS.map((syn) => {
                    const isDiscovered = discoveredSynergies.includes(syn.id);
                    const isActive = activeSynergies.includes(syn.id);
                    return (
                      <div
                        key={syn.id}
                        className={`codex-entry ${isDiscovered ? `discovered tier-${syn.tier}` : 'hidden-syn'}`}
                      >
                        {isActive && <div className="ce-active-badge"></div>}
                        <div className="ce-shimmer"></div>
                        <div className="ce-header">
                          <span className="ce-icon">{isDiscovered ? syn.icon : '?'}</span>
                          <span className="ce-name">{isDiscovered ? syn.name : '???'}</span>
                          <span className="ce-tier-pip">{isDiscovered ? syn.tier : '???'}</span>
                        </div>
                        <div className="ce-desc">
                          {isDiscovered ? syn.desc : 'Undiscovered synergy'}
                        </div>
                        {isDiscovered && (
                          <div className="ce-reqs">
                            {Object.entries(syn.requires).map(([key, req]) => {
                              const current = playerUpgrades[key] || 0;
                              const met = current >= req;
                              return (
                                <span key={key} className={`ce-req-chip ${met ? 'met' : 'unmet'}`}>
                                  {key}: {current}/{req}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          <button
            className="upgrade-continue"
            onClick={handleContinue}
            aria-label="Continue to next wave"
          >
            CONTINUE
          </button>
        </div>
      </div>

      {toasts.length > 0 && (
        <div
          id="toast-container"
          style={{
            position: 'fixed',
            top: '80px',
            right: '30px',
            zIndex: 35,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {toasts
            .filter((t) => t.life > 0)
            .map((t) => (
              <div key={t.id} className={t.type === 'achievement' ? 'ach-toast' : 'synergy-toast'}>
                {t.type === 'achievement' ? (
                  <>
                    <span className="ach-icon">{t.icon}</span>
                    <div className="ach-text">
                      <span className="ach-label">ACHIEVEMENT</span>
                      <span className="ach-name">{t.name}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="ach-icon">{t.icon}</span>
                    <div className="ach-text">
                      <span
                        className="ach-label"
                        style={{
                          color:
                            t.tier === 'gold'
                              ? '#ffd700'
                              : t.tier === 'silver'
                                ? '#c0c0c0'
                                : '#cd7f32',
                        }}
                      >
                        SYNERGY ACTIVATED
                      </span>
                      <span className="ach-name">{t.name}</span>
                      <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
                        {t.desc}
                      </span>
                    </div>
                  </>
                )}
              </div>
            ))}
        </div>
      )}

      <div
        className="perf"
        id="perf"
        aria-hidden="true"
        role="status"
        style={{ display: gameState === 'playing' ? 'block' : 'none' }}
      >
        {`FPS: ${fps}\nENTITIES: ${getEnemyCount() + getKillCount()}`}
      </div>

      <button
        id="accessibility-btn"
        aria-haspopup="true"
        aria-expanded={showA11y}
        aria-controls="colorblind-panel"
        aria-label="Accessibility options"
        className={gameState === 'playing' ? 'active' : ''}
        style={{ display: gameState === 'playing' ? 'block' : 'none' }}
        onClick={() => setShowA11y(!showA11y)}
      >
        ♿ A11Y
      </button>

      {showA11y && (
        <div
          id="colorblind-panel"
          role="dialog"
          aria-label="Accessibility options panel"
          className="open"
        >
          <div className="cb-title">DISPLAY MODE</div>
          {['normal', 'protanopia', 'deuteranopia', 'tritanopia', 'high-contrast'].map((mode) => (
            <label key={mode} className="cb-option">
              <input
                type="radio"
                name="cb"
                value={mode}
                checked={cbMode === mode}
                onChange={() => setCbMode(mode)}
              />
              {mode.charAt(0).toUpperCase() + mode.slice(1).replace('-', ' ')}
            </label>
          ))}
        </div>
      )}

      <div id="touch-joystick-zone" aria-hidden="true" role="presentation"></div>
      <div id="joystick-base" aria-hidden="true"></div>
      <div id="joystick-thumb" aria-hidden="true"></div>
      <div id="touch-fire-zone" aria-hidden="true" role="presentation"></div>
      <div id="touch-fire-btn" aria-label="Fire" role="button" aria-hidden="true">
        🔥
      </div>
      <div
        id="touch-ability-bar"
        aria-hidden="true"
        role="toolbar"
        aria-label="Touch ability buttons"
      >
        <div className="touch-ab-btn" data-ab="0" aria-label="Ability Q">
          🔥<div className="t-cd" style={{ height: '0%' }}></div>
        </div>
        <div className="touch-ab-btn" data-ab="2" aria-label="Ability E">
          🛡️<div className="t-cd" style={{ height: '0%' }}></div>
        </div>
        <div className="touch-ab-btn" data-ab="3" aria-label="Ability R">
          💀<div className="t-cd" style={{ height: '0%' }}></div>
        </div>
      </div>

      <div
        className={`minimap ${gameState === 'playing' ? 'active' : ''}`}
        id="minimap"
        role="img"
        aria-label="Mini-map showing enemy positions"
      >
        <canvas id="minimap-canvas" ref={minimapRef} width="140" height="140"></canvas>
      </div>
    </>
  );
}

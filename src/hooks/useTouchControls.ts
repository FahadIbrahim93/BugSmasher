import { useRef, useCallback } from 'react';

export interface TouchControlState {
  movement: { x: number; y: number };
  firing: boolean;
  aimPosition: { x: number; y: number } | null;
  activeAbilities: Set<string>;
}

export function useTouchControls(
  onMovementChange: (dx: number, dy: number) => void,
  onFireStart: () => void,
  onFireEnd: () => void,
  onAimMove: (x: number, y: number) => void,
  onAbility: (ability: string) => void
) {
  const touchState = useRef({
    movement: { x: 0, y: 0 },
    firing: false,
    aimPosition: null as { x: number; y: number } | null,
    activeAbilities: new Set<string>(),
    basePos: { x: 0, y: 0 },
    joystickTouchId: null as number | null,
    fireTouchId: null as number | null,
  });

  const handleTouchStart = useCallback(
    (e: TouchEvent, zone: 'joystick' | 'fire') => {
      e.preventDefault();
      const state = touchState.current;

      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];

        if (zone === 'joystick' && state.joystickTouchId === null) {
          state.joystickTouchId = t.identifier;
          state.basePos = { x: t.clientX, y: t.clientY };
          state.movement = { x: 0, y: 0 };
        } else if (zone === 'fire' && state.fireTouchId === null) {
          state.fireTouchId = t.identifier;
          state.firing = true;
          state.aimPosition = { x: t.clientX, y: t.clientY };
          onFireStart();
        }
      }
    },
    [onFireStart]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent, zone: 'joystick' | 'fire') => {
      e.preventDefault();
      const state = touchState.current;

      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];

        if (t.identifier === state.joystickTouchId) {
          const dx = t.clientX - state.basePos.x;
          const dy = t.clientY - state.basePos.y;
          const mag = Math.min(Math.hypot(dx, dy), 50);
          const angle = Math.atan2(dy, dx);

          if (mag > 10) {
            const normX = (Math.cos(angle) * mag) / 50;
            const normY = (Math.sin(angle) * mag) / 50;
            state.movement = { x: normX, y: normY };
            onMovementChange(normX, normY);
          } else {
            state.movement = { x: 0, y: 0 };
            onMovementChange(0, 0);
          }
        } else if (t.identifier === state.fireTouchId) {
          state.aimPosition = { x: t.clientX, y: t.clientY };
          onAimMove(t.clientX, t.clientY);
        }
      }
    },
    [onMovementChange, onAimMove]
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent, zone: 'joystick' | 'fire') => {
      e.preventDefault();
      const state = touchState.current;

      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];

        if (t.identifier === state.joystickTouchId) {
          state.joystickTouchId = null;
          state.movement = { x: 0, y: 0 };
          onMovementChange(0, 0);
        } else if (t.identifier === state.fireTouchId) {
          state.fireTouchId = null;
          state.firing = false;
          state.aimPosition = null;
          onFireEnd();
        }
      }
    },
    [onMovementChange, onFireEnd]
  );

  const handleAbilityTouch = useCallback(
    (e: TouchEvent) => {
      e.preventDefault();
      const btn = e.currentTarget as HTMLElement;
      const abIndex = btn.getAttribute('data-ab');
      const abilityMap: Record<string, string> = {
        '0': 'q',
        '1': 'w',
        '2': 'e',
        '3': 'r',
      };
      const key = abilityMap[abIndex ?? ''];
      if (key) {
        onAbility(key);
      }
    },
    [onAbility]
  );

  return {
    touchState,
    handlers: {
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
      handleAbilityTouch,
    },
  };
}

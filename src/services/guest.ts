/**
 * Guest Mode Service
 * Manages guest gameplay without authentication or persistent storage
 */

export interface GuestSession {
  sessionId: string;
  startTime: number;
  isGuest: true;
  displayName: string;
}

let currentGuestSession: GuestSession | null = null;

/**
 * Create a new guest session
 */
export function createGuestSession(): GuestSession {
  const sessionId = `guest_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  currentGuestSession = {
    sessionId,
    startTime: Date.now(),
    isGuest: true,
    displayName: `Guest_${Math.floor(Math.random() * 10000)}`
  };
  
  console.log('[v0] Guest session created:', sessionId);
  return currentGuestSession;
}

/**
 * Get current guest session
 */
export function getCurrentGuestSession(): GuestSession | null {
  return currentGuestSession;
}

/**
 * Check if currently in guest mode
 */
export function isGuestMode(): boolean {
  return currentGuestSession !== null;
}

/**
 * End guest session
 */
export function endGuestSession(): void {
  if (currentGuestSession) {
    console.log('[v0] Guest session ended:', currentGuestSession.sessionId);
  }
  currentGuestSession = null;
}

/**
 * Get session duration in milliseconds
 */
export function getSessionDuration(): number {
  if (!currentGuestSession) return 0;
  return Date.now() - currentGuestSession.startTime;
}

/**
 * Get guest display name
 */
export function getGuestDisplayName(): string {
  return currentGuestSession?.displayName || 'Guest';
}

/**
 * Guest data placeholder - in-memory only, no persistence
 */
export const guestGameStats = {
  highScore: 0,
  maxWave: 0,
  totalKills: 0,
  sessionScore: 0,
  sessionWave: 1,
  sessionKills: 0,
  playTime: 0,
};

/**
 * Reset session stats
 */
export function resetSessionStats(): void {
  guestGameStats.sessionScore = 0;
  guestGameStats.sessionWave = 1;
  guestGameStats.sessionKills = 0;
  guestGameStats.playTime = 0;
}

/**
 * Update session stats
 */
export function updateSessionStats(
  score: number,
  wave: number,
  kills: number
): void {
  guestGameStats.sessionScore = score;
  guestGameStats.sessionWave = wave;
  guestGameStats.sessionKills = kills;
  guestGameStats.playTime = getSessionDuration();
  
  // Track all-time bests (in-memory only)
  if (score > guestGameStats.highScore) {
    guestGameStats.highScore = score;
  }
  if (wave > guestGameStats.maxWave) {
    guestGameStats.maxWave = wave;
  }
  if (kills > guestGameStats.totalKills) {
    guestGameStats.totalKills = kills;
  }
}

/**
 * Get guest statistics
 */
export function getGuestStats() {
  return {
    ...guestGameStats,
    sessionDuration: getSessionDuration(),
    displayName: getGuestDisplayName()
  };
}

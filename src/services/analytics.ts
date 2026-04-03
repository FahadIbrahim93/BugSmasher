/**
 * Advanced Analytics and Telemetry Service
 * Tracks user engagement, game metrics, and system health
 */

export interface AnalyticsEvent {
  eventName: string;
  timestamp: number;
  userId?: string;
  data: {
    [key: string]: any;
  };
  sessionId: string;
  platform: string;
  userAgent: string;
}

export interface GameplayMetrics {
  sessionId: string;
  userId?: string;
  startTime: number;
  endTime?: number;
  duration: number;
  gamesPlayed: number;
  gamesCompleted: number;
  totalScore: number;
  averageScore: number;
  maxWave: number;
  totalPlaytime: number;
}

export interface UserEngagement {
  userId: string;
  lastActive: number;
  totalSessions: number;
  averageSessionDuration: number;
  daysActive: number;
  churnRisk: boolean; // True if user hasn't played in 7+ days
  conversionState: 'new' | 'active' | 'inactive' | 'churned';
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private sessionId = this.generateSessionId();
  private events: AnalyticsEvent[] = [];
  private maxEventsBeforeFlush = 100;
  private sessionStartTime = Date.now();
  private userId?: string;
  private isEnabled = true;

  private constructor() {
    console.log('[v0] Analytics service initialized with session ID:', this.sessionId);
  }

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Initialize analytics for a user
   */
  setUserId(userId: string): void {
    this.userId = userId;
    this.trackEvent('user_session_start', {
      userId,
      timestamp: Date.now(),
    });
    console.log('[v0] Analytics user set:', userId);
  }

  /**
   * Track a custom event
   */
  trackEvent(eventName: string, data: { [key: string]: any } = {}): void {
    if (!this.isEnabled) return;

    const event: AnalyticsEvent = {
      eventName,
      timestamp: Date.now(),
      userId: this.userId,
      data,
      sessionId: this.sessionId,
      platform: this.getPlatform(),
      userAgent: navigator.userAgent,
    };

    this.events.push(event);
    console.log(`[v0] Event tracked: ${eventName}`, data);

    if (this.events.length >= this.maxEventsBeforeFlush) {
      this.flushEvents();
    }
  }

  /**
   * Track game start
   */
  trackGameStart(heroClass: string): void {
    this.trackEvent('game_start', {
      heroClass,
      timestamp: Date.now(),
    });
  }

  /**
   * Track game end
   */
  trackGameEnd(
    score: number,
    wave: number,
    kills: number,
    duration: number,
    survived: boolean
  ): void {
    this.trackEvent('game_end', {
      score,
      wave,
      kills,
      duration,
      survived,
      timestamp: Date.now(),
    });
  }

  /**
   * Track ability usage
   */
  trackAbilityUsed(abilityId: string, cooldown: number): void {
    this.trackEvent('ability_used', {
      abilityId,
      cooldown,
      timestamp: Date.now(),
    });
  }

  /**
   * Track upgrade selection
   */
  trackUpgradeSelected(upgradeId: string, rarity: string): void {
    this.trackEvent('upgrade_selected', {
      upgradeId,
      rarity,
      timestamp: Date.now(),
    });
  }

  /**
   * Track achievement unlocked
   */
  trackAchievementUnlocked(achievementId: string, name: string): void {
    this.trackEvent('achievement_unlocked', {
      achievementId,
      name,
      timestamp: Date.now(),
    });
  }

  /**
   * Track social interaction
   */
  trackSocialAction(action: 'share' | 'invite' | 'view_leaderboard', data: any): void {
    this.trackEvent(`social_${action}`, data);
  }

  /**
   * Track error
   */
  trackError(errorMessage: string, errorStack?: string, context?: string): void {
    this.trackEvent('error_occurred', {
      errorMessage,
      errorStack,
      context,
      timestamp: Date.now(),
    });
  }

  /**
   * Track page/view
   */
  trackPageView(pageName: string, properties?: { [key: string]: any }): void {
    this.trackEvent('page_view', {
      pageName,
      ...properties,
      timestamp: Date.now(),
    });
  }

  /**
   * Flush events to backend (simulated)
   */
  private flushEvents(): void {
    if (this.events.length === 0) return;

    console.log('[v0] Flushing', this.events.length, 'analytics events');

    // In production, this would send events to analytics backend
    // Example: fetch('/api/analytics/events', { method: 'POST', body: JSON.stringify(this.events) })

    // For now, just log and clear
    this.events = [];
  }

  /**
   * Get platform information
   */
  private getPlatform(): string {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('mobile')) return 'mobile';
    if (userAgent.includes('tablet')) return 'tablet';
    return 'desktop';
  }

  /**
   * Calculate user engagement metrics
   */
  calculateEngagementMetrics(
    userId: string,
    sessions: number,
    totalDuration: number,
    daysActive: number,
    lastActiveTime: number
  ): UserEngagement {
    const daysSinceActive = (Date.now() - lastActiveTime) / (1000 * 60 * 60 * 24);
    const churnRisk = daysSinceActive > 7;
    let conversionState: 'new' | 'active' | 'inactive' | 'churned' = 'active';

    if (churnRisk) {
      conversionState = daysSinceActive > 30 ? 'churned' : 'inactive';
    } else if (sessions <= 1) {
      conversionState = 'new';
    }

    return {
      userId,
      lastActive: lastActiveTime,
      totalSessions: sessions,
      averageSessionDuration: sessions > 0 ? totalDuration / sessions : 0,
      daysActive,
      churnRisk,
      conversionState,
    };
  }

  /**
   * Get session duration
   */
  getSessionDuration(): number {
    return Date.now() - this.sessionStartTime;
  }

  /**
   * Get session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Get pending events count
   */
  getPendingEventsCount(): number {
    return this.events.length;
  }

  /**
   * Enable/disable analytics
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    console.log('[v0] Analytics', enabled ? 'enabled' : 'disabled');
  }

  /**
   * End session and flush all events
   */
  endSession(): void {
    this.trackEvent('session_end', {
      sessionDuration: this.getSessionDuration(),
      totalEvents: this.events.length,
    });
    this.flushEvents();
    console.log('[v0] Analytics session ended');
  }

  /**
   * Get analytics summary
   */
  getSummary(): {
    sessionId: string;
    sessionDuration: number;
    pendingEvents: number;
    userId?: string;
    platform: string;
  } {
    return {
      sessionId: this.sessionId,
      sessionDuration: this.getSessionDuration(),
      pendingEvents: this.events.length,
      userId: this.userId,
      platform: this.getPlatform(),
    };
  }
}

export const analyticsService = AnalyticsService.getInstance();

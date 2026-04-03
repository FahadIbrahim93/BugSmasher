/**
 * Performance Monitoring and Optimization Service
 * Tracks frame rate, memory usage, and render performance
 */

export interface PerformanceMetrics {
  fps: number;
  avgFrameTime: number;
  maxFrameTime: number;
  minFrameTime: number;
  memoryUsed: number;
  memoryLimit: number;
  renderTime: number;
  updateTime: number;
  gc: {
    count: number;
    lastTime: number;
  };
}

export interface PerformanceThresholds {
  fpsWarning: number;
  fpsOptimal: number;
  frameTimeWarning: number;
  memoryWarning: number;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Partial<PerformanceMetrics> = {};
  private frameCount = 0;
  private lastTime = performance.now();
  private frameTimes: number[] = [];
  private readonly maxSamples = 60;
  private thresholds: PerformanceThresholds = {
    fpsWarning: 30,
    fpsOptimal: 60,
    frameTimeWarning: 16.67, // 60 FPS target
    memoryWarning: 50 * 1024 * 1024, // 50MB
  };

  private isMonitoring = false;
  private monitoringStartTime = 0;

  private constructor() {
    this.initializeMetrics();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Initialize metrics object
   */
  private initializeMetrics(): void {
    this.metrics = {
      fps: 0,
      avgFrameTime: 0,
      maxFrameTime: 0,
      minFrameTime: Infinity,
      memoryUsed: 0,
      memoryLimit: 0,
      renderTime: 0,
      updateTime: 0,
      gc: {
        count: 0,
        lastTime: 0,
      },
    };
  }

  /**
   * Start performance monitoring
   */
  startMonitoring(): void {
    this.isMonitoring = true;
    this.monitoringStartTime = performance.now();
    console.log('[v0] Performance monitoring started');
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
    console.log('[v0] Performance monitoring stopped');
  }

  /**
   * Record frame time
   */
  recordFrame(): void {
    if (!this.isMonitoring) return;

    const now = performance.now();
    const frameTime = now - this.lastTime;
    this.lastTime = now;

    this.frameTimes.push(frameTime);
    if (this.frameTimes.length > this.maxSamples) {
      this.frameTimes.shift();
    }

    this.frameCount++;

    // Update metrics every 60 frames
    if (this.frameCount % 60 === 0) {
      this.updateMetrics();
    }
  }

  /**
   * Update performance metrics
   */
  private updateMetrics(): void {
    if (this.frameTimes.length === 0) return;

    const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    const fps = 1000 / avgFrameTime;
    const maxFrameTime = Math.max(...this.frameTimes);
    const minFrameTime = Math.min(...this.frameTimes);

    this.metrics.fps = Math.round(fps);
    this.metrics.avgFrameTime = Math.round(avgFrameTime * 100) / 100;
    this.metrics.maxFrameTime = Math.round(maxFrameTime * 100) / 100;
    this.metrics.minFrameTime = Math.round(minFrameTime * 100) / 100;

    // Memory monitoring (if available)
    if ((performance as any).memory) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsed = memory.usedJSHeapSize;
      this.metrics.memoryLimit = memory.jsHeapSizeLimit;
    }

    this.logMetrics();
  }

  /**
   * Log current metrics
   */
  private logMetrics(): void {
    const warning =
      this.metrics.fps! < this.thresholds.fpsWarning
        ? ' [WARNING: Low FPS]'
        : '';
    console.log(
      `[v0] FPS: ${this.metrics.fps}, AvgFrame: ${this.metrics.avgFrameTime}ms${warning}`
    );
  }

  /**
   * Record render time
   */
  recordRenderTime(duration: number): void {
    if (this.metrics.renderTime !== undefined) {
      this.metrics.renderTime = duration;
    }
  }

  /**
   * Record update time
   */
  recordUpdateTime(duration: number): void {
    if (this.metrics.updateTime !== undefined) {
      this.metrics.updateTime = duration;
    }
  }

  /**
   * Get current metrics
   */
  getMetrics(): PerformanceMetrics {
    return {
      fps: this.metrics.fps || 0,
      avgFrameTime: this.metrics.avgFrameTime || 0,
      maxFrameTime: this.metrics.maxFrameTime || 0,
      minFrameTime: this.metrics.minFrameTime || 0,
      memoryUsed: this.metrics.memoryUsed || 0,
      memoryLimit: this.metrics.memoryLimit || 0,
      renderTime: this.metrics.renderTime || 0,
      updateTime: this.metrics.updateTime || 0,
      gc: this.metrics.gc || { count: 0, lastTime: 0 },
    };
  }

  /**
   * Get performance assessment
   */
  getPerformanceAssessment(): 'excellent' | 'good' | 'warning' | 'critical' {
    const fps = this.metrics.fps || 0;

    if (fps >= this.thresholds.fpsOptimal) {
      return 'excellent';
    } else if (fps >= this.thresholds.fpsWarning) {
      return 'good';
    } else if (fps >= this.thresholds.fpsWarning / 2) {
      return 'warning';
    }
    return 'critical';
  }

  /**
   * Get optimization suggestions
   */
  getOptimizationSuggestions(): string[] {
    const suggestions: string[] = [];
    const assessment = this.getPerformanceAssessment();

    if (assessment === 'critical') {
      suggestions.push('Reduce particle effects');
      suggestions.push('Lower draw distance');
      suggestions.push('Reduce enemy count');
    } else if (assessment === 'warning') {
      suggestions.push('Consider reducing visual effects');
      suggestions.push('Monitor memory usage');
    }

    if (this.metrics.memoryUsed! > this.thresholds.memoryWarning) {
      suggestions.push('High memory usage detected - consider optimizing assets');
    }

    return suggestions;
  }

  /**
   * Reset metrics
   */
  reset(): void {
    this.initializeMetrics();
    this.frameCount = 0;
    this.frameTimes = [];
    this.lastTime = performance.now();
    console.log('[v0] Performance metrics reset');
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

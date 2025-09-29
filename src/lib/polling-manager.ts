import { getLeaders, getActivePart } from './api';
import { Leader, Part } from './data';

export class PollingManager {
  private pollInterval: NodeJS.Timeout | null = null;
  private isPolling = false;
  private intervals = {
    normal: 10000,    // 10 seconds normal
    aggressive: 3000, // 3 seconds when connection issues
    background: 30000 // 30 seconds when in background
  };
  private currentInterval = this.intervals.normal;
  private consecutiveErrors = 0;
  private maxErrors = 3;

  constructor(
    private onLeadersUpdate: (leaders: Leader[]) => void,
    private onActivePartUpdate: (activePart: Part | null) => void,
    private onError?: (error: string) => void
  ) {}

  start() {
    if (this.isPolling) return;
    
    this.isPolling = true;
    console.log('🔄 Starting polling manager');
    this.scheduleNextPoll();
  }

  stop() {
    this.isPolling = false;
    if (this.pollInterval) {
      clearTimeout(this.pollInterval);
      this.pollInterval = null;
    }
    console.log('⏹️ Stopped polling manager');
  }

  // Switch to aggressive mode when connection issues detected
  setAggressive(aggressive: boolean) {
    const newInterval = aggressive ? this.intervals.aggressive : this.intervals.normal;
    if (newInterval !== this.currentInterval) {
      this.currentInterval = newInterval;
      console.log(`📊 Polling switched to ${aggressive ? 'aggressive' : 'normal'} mode (${newInterval}ms)`);
      this.reschedule();
    }
  }

  // Switch to background mode when page is hidden
  setBackground(background: boolean) {
    const newInterval = background ? this.intervals.background : this.intervals.normal;
    if (newInterval !== this.currentInterval) {
      this.currentInterval = newInterval;
      console.log(`🌙 Polling switched to ${background ? 'background' : 'foreground'} mode (${newInterval}ms)`);
      this.reschedule();
    }
  }

  private reschedule() {
    if (this.pollInterval) {
      clearTimeout(this.pollInterval);
    }
    if (this.isPolling) {
      this.scheduleNextPoll();
    }
  }

  private scheduleNextPoll() {
    this.pollInterval = setTimeout(() => {
      this.poll();
    }, this.currentInterval);
  }

  private async poll() {
    if (!this.isPolling) return;

    try {
      console.log('📡 Polling for updates...');
      const [leadersData, activePartData] = await Promise.all([
        getLeaders(),
        getActivePart()
      ]);

      this.onLeadersUpdate(leadersData);
      this.onActivePartUpdate(activePartData);
      
      // Reset error counter on success
      this.consecutiveErrors = 0;
      
      // Switch back to normal mode if we were in aggressive mode due to errors
      if (this.currentInterval === this.intervals.aggressive) {
        this.setAggressive(false);
      }

    } catch (error) {
      this.consecutiveErrors++;
      console.error(`❌ Polling error (${this.consecutiveErrors}/${this.maxErrors}):`, error);
      
      // Switch to aggressive mode if too many errors
      if (this.consecutiveErrors >= this.maxErrors && this.currentInterval !== this.intervals.aggressive) {
        this.setAggressive(true);
      }

      if (this.onError) {
        this.onError(error instanceof Error ? error.message : 'Polling error');
      }
    }

    // Schedule next poll
    if (this.isPolling) {
      this.scheduleNextPoll();
    }
  }

  // Force an immediate poll
  pollNow() {
    if (this.pollInterval) {
      clearTimeout(this.pollInterval);
    }
    this.poll();
  }

  getStatus() {
    return {
      isPolling: this.isPolling,
      currentInterval: this.currentInterval,
      consecutiveErrors: this.consecutiveErrors
    };
  }
}
// Polling service để thay thế WebSocket cho real-time updates
import { Leader, Part } from './data';

export class PollingService {
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private readonly POLLING_INTERVAL = 2000; // 2 giây

  /**
   * Bắt đầu polling cho leaders
   */
  startLeadersPolling(onUpdate: (data: Leader[]) => void) {
    this.stopPolling('leaders');
    
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/leaders');
        if (response.ok) {
          const result = await response.json();
          if (result.success && Array.isArray(result.data)) {
            onUpdate(result.data as Leader[]);
          }
        }
      } catch (error) {
        console.error('Error polling leaders:', error);
      }
    }, this.POLLING_INTERVAL);
    
    this.intervals.set('leaders', interval);
  }

  /**
   * Bắt đầu polling cho parts
   */
  startPartsPolling(onUpdate: (data: Part[]) => void) {
    this.stopPolling('parts');
    
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/parts');
        if (response.ok) {
          const result = await response.json();
          if (result.success && Array.isArray(result.data)) {
            onUpdate(result.data as Part[]);
          }
        }
      } catch (error) {
        console.error('Error polling parts:', error);
      }
    }, this.POLLING_INTERVAL);
    
    this.intervals.set('parts', interval);
  }

  /**
   * Bắt đầu polling cho active part
   */
  startActivePartPolling(onUpdate: (data: Part | null) => void) {
    this.stopPolling('activePart');
    
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/parts/active');
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            onUpdate(result.data as Part | null);
          }
        }
      } catch (error) {
        console.error('Error polling active part:', error);
      }
    }, this.POLLING_INTERVAL);
    
    this.intervals.set('activePart', interval);
  }

  /**
   * Dừng polling cho một loại dữ liệu cụ thể
   */
  stopPolling(type: string) {
    const interval = this.intervals.get(type);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(type);
    }
  }

  /**
   * Dừng tất cả polling
   */
  stopAllPolling() {
    this.intervals.forEach((interval) => {
      clearInterval(interval);
    });
    this.intervals.clear();
  }

  /**
   * Kiểm tra xem có đang polling không
   */
  isPolling(type: string): boolean {
    return this.intervals.has(type);
  }
}

// Singleton instance
export const pollingService = new PollingService();

import { Leader, Part } from './data';
import { CONFIG } from './config';

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private heartbeatTimeout: NodeJS.Timeout | null = null;
  private lastHeartbeat = 0;
  private isManuallyDisconnected = false;
  private pollingInterval: NodeJS.Timeout | null = null;
  private lastDataRefresh = 0;
  private visibilityChangeHandler: (() => void) | null = null;
  private focusHandler: (() => void) | null = null;

  constructor(
    private onLeadersUpdate: (leaders: Leader[]) => void,
    private onPartsUpdate: (parts: Part[]) => void,
    private onActivePartUpdate: (activePart: Part | null) => void,
    private forceDataRefresh?: () => Promise<void>
  ) {
    this.setupVisibilityHandler();
  }

  connect(url: string = CONFIG.getWebSocketUrl()) {
    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('✅ WebSocket connected');
        this.reconnectAttempts = 0;
        this.isManuallyDisconnected = false;
        this.startHeartbeat();
        this.stopPolling(); // Stop polling fallback when WebSocket is connected
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle heartbeat pong
          if (data.type === 'pong') {
            if (this.heartbeatTimeout) {
              clearTimeout(this.heartbeatTimeout);
              this.heartbeatTimeout = null;
            }
            return;
          }
          
          // Check if it's a typed message
          if (data.type) {
            switch (data.type) {
              case 'ACTIVE_PART':
                this.onActivePartUpdate(data.data);
                break;
              case 'SYSTEM_RESET':
                console.log('🔄 SYSTEM_RESET received:', data.data?.message || data?.message || 'System has been reset');
                // Force immediate refresh data when system is reset
                if (this.forceDataRefresh) {
                  console.log('🔄 Auto-refreshing data due to system reset...');
                  // Use immediate refresh instead of delay
                  this.forceDataRefresh().catch(console.error);
                } else {
                  console.warn('⚠️ No forceDataRefresh function available');
                }
                break;
              default:
                console.log('Unknown message type:', data.type);
            }
          } else if (Array.isArray(data)) {
            // Check if it's leaders or parts data
            if (data.length > 0 && 'name' in data[0] && 'completed' in data[0]) {
              // It's leaders data
              this.onLeadersUpdate(data);
            } else if (data.length > 0 && 'active' in data[0]) {
              // It's parts data
              this.onPartsUpdate(data);
              // Find active part
              const activePart = data.find((p: Part) => p.active);
              this.onActivePartUpdate(activePart || null);
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('❌ WebSocket disconnected');
        this.stopHeartbeat();
        if (!this.isManuallyDisconnected) {
          this.startPolling(); // Start polling fallback when WebSocket disconnects
          this.attemptReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`📱 Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        // Only reconnect if page is visible (important for mobile)
        if (!document.hidden) {
          this.connect();
        } else {
          // If page is hidden, try again when it becomes visible
          this.attemptReconnect();
        }
      }, this.reconnectDelay * Math.min(this.reconnectAttempts, 5)); // Cap delay at 5x
    } else {
      console.log('❌ Max reconnection attempts reached');
      // Reset counter after a longer delay for mobile scenarios
      setTimeout(() => {
        this.reconnectAttempts = 0;
        console.log('🔄 Reset reconnection counter');
      }, 30000);
    }
  }

  disconnect() {
    this.isManuallyDisconnected = true;
    this.stopHeartbeat();
    this.stopPolling();
    this.removeVisibilityHandler();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    
    // Send ping every 30 seconds
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping', timestamp: Date.now() });
        this.lastHeartbeat = Date.now();
        
        // Set timeout to detect if server doesn't respond
        this.heartbeatTimeout = setTimeout(() => {
          console.log('💔 Heartbeat timeout, reconnecting...');
          this.forceReconnect();
        }, 10000); // 10 second timeout
      }
    }, 30000);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
  }

  // Force reconnect method for mobile scenarios
  forceReconnect() {
    console.log('🔄 Force reconnecting WebSocket...');
    this.disconnect();
    this.reconnectAttempts = 0;
    this.connect();
  }

  // Check connection status
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  send(message: unknown) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  // Polling fallback for mobile scenarios
  private startPolling() {
    if (this.pollingInterval) return; // Already polling
    
    console.log('🔄 Starting polling fallback for mobile...');
    this.pollingInterval = setInterval(async () => {
      if (this.isConnected() || this.isManuallyDisconnected) {
        this.stopPolling();
        return;
      }
      
      // Only poll if page is visible and we have a refresh function
      if (!document.hidden && this.forceDataRefresh) {
        const now = Date.now();
        if (now - this.lastDataRefresh > 2000) { // Avoid too frequent polling
          this.lastDataRefresh = now;
          try {
            await this.forceDataRefresh();
            console.log('🔄 Polling data refresh completed');
          } catch (error) {
            console.error('❌ Polling data refresh failed:', error);
          }
        }
      }
    }, 5000); // Poll every 5 seconds
  }

  private stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      console.log('⏹️ Stopped polling fallback');
    }
  }

  // Page Visibility API for mobile app lifecycle
  private setupVisibilityHandler() {
    this.visibilityChangeHandler = () => {
      if (!document.hidden) {
        console.log('👁️ Page became visible - checking connection...');
        // Force reconnect if disconnected when page becomes visible
        if (!this.isConnected() && !this.isManuallyDisconnected) {
          console.log('🔄 Force reconnecting on page visibility...');
          this.reconnectAttempts = 0; // Reset attempts
          this.connect();
        }
        // Also force data refresh after a short delay
        if (this.forceDataRefresh) {
          setTimeout(() => {
            if (this.forceDataRefresh) {
              this.forceDataRefresh().catch(console.error);
            }
          }, 1000);
        }
      } else {
        console.log('👁️ Page became hidden');
      }
    };
    
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.visibilityChangeHandler);
      
      // Also listen for window focus events (additional mobile detection)
      const focusHandler = () => {
        console.log('🎯 Window focused - checking connection...');
        if (!this.isConnected() && !this.isManuallyDisconnected) {
          this.reconnectAttempts = 0;
          this.connect();
        }
        if (this.forceDataRefresh) {
          setTimeout(() => {
            if (this.forceDataRefresh) {
              this.forceDataRefresh().catch(console.error);
            }
          }, 500);
        }
      };
      
      window.addEventListener('focus', focusHandler);
      
      // Store focus handler for cleanup
      this.focusHandler = focusHandler;
    }
  }

  private removeVisibilityHandler() {
    if (this.visibilityChangeHandler && typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
      this.visibilityChangeHandler = null;
    }
    
    if (this.focusHandler && typeof window !== 'undefined') {
      window.removeEventListener('focus', this.focusHandler);
      this.focusHandler = null;
    }
  }
}

import { WebSocketClient } from './websocket-client';
import { PollingManager } from './polling-manager';
import { NetworkManager } from './network-manager';
import { Leader, Part } from './data';

export class SyncManager {
  private wsClient: WebSocketClient;
  private pollingManager: PollingManager;
  private networkManager: NetworkManager;
  private networkCleanup: (() => void) | null = null;
  private lastDataTimestamp = 0;
  private isDestroyed = false;

  constructor(
    private onLeadersUpdate: (leaders: Leader[]) => void,
    private onPartsUpdate: (parts: Part[]) => void,
    private onActivePartUpdate: (activePart: Part | null) => void,
    private onError?: (error: string) => void
  ) {
    // Create WebSocket client
    this.wsClient = new WebSocketClient(
      (leaders) => {
        this.lastDataTimestamp = Date.now();
        this.onLeadersUpdate(leaders);
      },
      (parts) => {
        this.lastDataTimestamp = Date.now();
        this.onPartsUpdate(parts);
      },
      (activePart) => {
        this.lastDataTimestamp = Date.now();
        this.onActivePartUpdate(activePart);
      }
    );

    // Create polling manager  
    this.pollingManager = new PollingManager(
      (leaders) => {
        this.lastDataTimestamp = Date.now();
        this.onLeadersUpdate(leaders);
      },
      (activePart) => {
        this.lastDataTimestamp = Date.now();
        this.onActivePartUpdate(activePart);
      },
      this.onError
    );

    // Create network manager
    this.networkManager = new NetworkManager();
    this.setupNetworkHandling();
  }

  private setupNetworkHandling() {
    this.networkCleanup = this.networkManager.addListener(() => {
      if (this.isDestroyed) return;

      const status = this.networkManager.getStatus();
      console.log('🌐 Network status changed:', status);

      if (status.isOnline) {
        // Back online - reconnect WebSocket and poll immediately
        if (!this.wsClient.isConnected()) {
          console.log('🔄 Reconnecting WebSocket after network change...');
          this.wsClient.forceReconnect();
        }
        
        // Force immediate poll
        this.pollingManager.pollNow();
        
        // Reset to normal polling if we were in aggressive mode
        this.pollingManager.setAggressive(false);
      } else {
        // Gone offline - switch to aggressive polling when back online
        console.log('📴 Gone offline, will use aggressive sync when back online');
      }

      // Adjust polling based on network conditions
      const shouldBeAggressive = this.networkManager.shouldUseAggressivePolling();
      this.pollingManager.setAggressive(shouldBeAggressive);

      // Handle background/foreground
      this.pollingManager.setBackground(!status.isVisible);

      // If page became visible, force refresh
      if (status.isVisible && status.hasFocus) {
        this.forceSync();
      }
    });
  }

  start() {
    console.log('🚀 Starting SyncManager with multi-layer sync strategy');
    
    // Start WebSocket
    this.wsClient.connect();
    
    // Start polling (always running as backup)
    this.pollingManager.start();
    
    // Initial sync
    this.forceSync();
  }

  stop() {
    this.isDestroyed = true;
    
    console.log('🛑 Stopping SyncManager');
    
    this.wsClient.disconnect();
    this.pollingManager.stop();
    this.networkManager.cleanup();
    
    if (this.networkCleanup) {
      this.networkCleanup();
    }
  }

  // Force immediate sync from all sources
  forceSync() {
    if (this.isDestroyed) return;
    
    console.log('⚡ Force syncing from all sources...');
    
    // Force WebSocket reconnect if not connected
    if (!this.wsClient.isConnected()) {
      this.wsClient.forceReconnect();
    }
    
    // Force immediate poll
    this.pollingManager.pollNow();
  }

  // Get comprehensive status
  getStatus() {
    return {
      websocket: {
        connected: this.wsClient.isConnected(),
      },
      polling: this.pollingManager.getStatus(),
      network: this.networkManager.getStatus(),
      lastDataTimestamp: this.lastDataTimestamp,
      timeSinceLastData: Date.now() - this.lastDataTimestamp
    };
  }

  // Check if sync is healthy (received data recently)
  isHealthy(): boolean {
    const timeSinceLastData = Date.now() - this.lastDataTimestamp;
    return timeSinceLastData < 60000; // Consider healthy if data received within 1 minute
  }
}
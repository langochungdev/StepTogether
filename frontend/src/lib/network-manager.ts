// Extend Navigator interface for connection API
interface NavigatorWithConnection extends Navigator {
  connection?: {
    effectiveType?: string;
    type?: string;
    addEventListener: (type: string, listener: () => void) => void;
    removeEventListener: (type: string, listener: () => void) => void;
  };
}

export class NetworkManager {
  private listeners: (() => void)[] = [];
  private lastOnlineState = navigator.onLine;
  private connectionType: string = 'unknown';

  constructor() {
    this.setupEventListeners();
    this.detectConnectionType();
  }

  private setupEventListeners() {
    // Online/offline detection
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));

    // Connection change detection (if supported)
    if ('connection' in navigator) {
      const connection = (navigator as NavigatorWithConnection).connection;
      if (connection) {
        connection.addEventListener('change', this.handleConnectionChange.bind(this));
      }
    }

    // Page visibility change
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

    // Focus/blur events
    window.addEventListener('focus', this.handleFocus.bind(this));
    window.addEventListener('blur', this.handleBlur.bind(this));
  }

  private detectConnectionType() {
    if ('connection' in navigator) {
      const connection = (navigator as NavigatorWithConnection).connection;
      if (connection) {
        this.connectionType = connection.effectiveType || connection.type || 'unknown';
      }
    }
  }

  private handleOnline() {
    console.log('🌐 Network: Back online');
    this.lastOnlineState = true;
    this.notifyListeners();
  }

  private handleOffline() {
    console.log('📴 Network: Gone offline');
    this.lastOnlineState = false;
    this.notifyListeners();
  }

  private handleConnectionChange() {
    console.log('📶 Network: Connection changed');
    this.detectConnectionType();
    this.notifyListeners();
  }

  private handleVisibilityChange() {
    if (!document.hidden) {
      console.log('👁️ Page: Became visible');
      this.notifyListeners();
    } else {
      console.log('🙈 Page: Became hidden');
    }
  }

  private handleFocus() {
    console.log('🎯 Window: Focused');
    this.notifyListeners();
  }

  private handleBlur() {
    console.log('😴 Window: Blurred');
  }

  private notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener();
      } catch (error) {
        console.error('Error in network change listener:', error);
      }
    });
  }

  // Add listener for network/visibility changes
  addListener(callback: () => void) {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Get current network status
  getStatus() {
    return {
      isOnline: navigator.onLine,
      connectionType: this.connectionType,
      isVisible: !document.hidden,
      hasFocus: document.hasFocus()
    };
  }

  // Check if we should use aggressive polling
  shouldUseAggressivePolling(): boolean {
    const status = this.getStatus();
    return !status.isOnline || 
           status.connectionType === 'slow-2g' || 
           status.connectionType === '2g' ||
           !status.isVisible;
  }

  cleanup() {
    window.removeEventListener('online', this.handleOnline.bind(this));
    window.removeEventListener('offline', this.handleOffline.bind(this));
    document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    window.removeEventListener('focus', this.handleFocus.bind(this));
    window.removeEventListener('blur', this.handleBlur.bind(this));

    if ('connection' in navigator) {
      const connection = (navigator as NavigatorWithConnection).connection;
      if (connection) {
        connection.removeEventListener('change', this.handleConnectionChange.bind(this));
      }
    }
  }
}
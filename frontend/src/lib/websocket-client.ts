import { Leader, Part } from './data';

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor(
    private onLeadersUpdate: (leaders: Leader[]) => void,
    private onPartsUpdate: (parts: Part[]) => void,
    private onActivePartUpdate: (activePart: Part | null) => void
  ) {}

  connect(url: string = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000/ws/updates') {
    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('✅ WebSocket connected');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Check if it's a typed message
          if (data.type && data.data) {
            switch (data.type) {
              case 'ACTIVE_PART':
                this.onActivePartUpdate(data.data);
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
        this.attemptReconnect();
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
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.log('Max reconnection attempts reached');
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(message: unknown) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }
}

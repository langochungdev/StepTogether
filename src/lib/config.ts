// Configuration file to generate all URLs from a single origin
const ORIGIN = process.env.NEXT_PUBLIC_ORIGIN || 'http://localhost:3000';

// Generate all URLs from the origin
export const CONFIG = {
  ORIGIN,
  API_URL: `${ORIGIN}/api`,
  WS_URL: `${ORIGIN}/ws/updates`,
  
  // Helper method to get WebSocket URL with correct protocol
  getWebSocketUrl(): string {
    if (ORIGIN.startsWith('https://')) {
      return ORIGIN.replace('https://', 'wss://') + '/ws/updates';
    } else if (ORIGIN.startsWith('http://')) {
      return ORIGIN.replace('http://', 'ws://') + '/ws/updates';
    }
    return `ws://${ORIGIN}/ws/updates`;
  }
};

export default CONFIG;
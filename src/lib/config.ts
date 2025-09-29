// Configuration file to generate all URLs from a single origin
const ORIGIN = process.env.NEXT_PUBLIC_ORIGIN || 'http://localhost:3000';

// Auto-detect protocol based on current location
const getCurrentOrigin = () => {
  if (typeof window !== 'undefined') {
    // Client-side: use current location
    return window.location.origin;
  }
  // Server-side: use environment variable
  return ORIGIN;
};

const CURRENT_ORIGIN = getCurrentOrigin();

// Generate all URLs from the origin
export const CONFIG = {
  ORIGIN: CURRENT_ORIGIN,
  API_URL: `${CURRENT_ORIGIN}/api`,
  WS_URL: `${CURRENT_ORIGIN}/ws/updates`,
  
  // Helper method to get WebSocket URL with correct protocol
  getWebSocketUrl(): string {
    if (CURRENT_ORIGIN.startsWith('https://')) {
      return CURRENT_ORIGIN.replace('https://', 'wss://') + '/ws/updates';
    } else if (CURRENT_ORIGIN.startsWith('http://')) {
      return CURRENT_ORIGIN.replace('http://', 'ws://') + '/ws/updates';
    }
    return `ws://${CURRENT_ORIGIN}/ws/updates`;
  }
};

export default CONFIG;
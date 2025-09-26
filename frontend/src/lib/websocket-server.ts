import { WebSocketServer } from 'ws';
import { getDatabase } from './database';

let wss: WebSocketServer | null = null;

export function startWebSocketServer(port: number = 8081) {
  if (wss) {
    console.log('WebSocket server already running');
    return wss;
  }

  wss = new WebSocketServer({ port });
  const db = getDatabase();

  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    // Add client to database
    db.addWebSocketClient(ws as any);
    
    // Send initial data
    const leaders = db.getLeaders();
    const parts = db.getParts();
    const activePart = db.getActivePart();
    
    ws.send(JSON.stringify(leaders));
    ws.send(JSON.stringify(parts));
    if (activePart) {
      ws.send(JSON.stringify({ type: 'ACTIVE_PART', data: activePart }));
    }

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      db.removeWebSocketClient(ws as any);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      db.removeWebSocketClient(ws as any);
    });
  });

  console.log(`WebSocket server started on port ${port}`);
  return wss;
}

export function stopWebSocketServer() {
  if (wss) {
    wss.close();
    wss = null;
    console.log('WebSocket server stopped');
  }
}

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { WebSocketServer } = require('ws');

// Initialize database - we'll create a simple in-memory database here
global.db = {
  leaders: new Map(),
  parts: new Map(),
  activePartId: null,
  wsClients: new Set(),

  getLeaders() {
    return Array.from(this.leaders.values());
  },

  registerLeader(name) {
    const id = Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    const leader = {
      id,
      name,
      needsHelp: false,
      completed: false,
      createdAt: new Date().toISOString(),
      todoList: []
    };
    this.leaders.set(id, leader);
    return leader;
  },

  completeLeader(id) {
    const leader = this.leaders.get(id);
    if (!leader) return null;
    leader.completed = true;
    this.leaders.set(id, leader);
    return leader;
  },

  deleteLeader(id) {
    const leader = this.leaders.get(id);
    if (!leader) return null;
    this.leaders.delete(id);
    return leader;
  },

  toggleLeaderHelp(id, needsHelp) {
    const leader = this.leaders.get(id);
    if (!leader) return null;
    leader.needsHelp = needsHelp;
    this.leaders.set(id, leader);
    return leader;
  },

  toggleLeaderTodo(leaderId, todoId) {
    const leader = this.leaders.get(leaderId);
    if (!leader) return null;
    const todo = leader.todoList.find(t => t.id === todoId);
    if (!todo) return null;
    todo.completed = !todo.completed;
    this.leaders.set(leaderId, leader);
    return { todoId, completed: todo.completed };
  },

  getParts() {
    return Array.from(this.parts.values());
  },

  getActivePart() {
    if (!this.activePartId) return null;
    return this.parts.get(this.activePartId) || null;
  },

  createPart(name, description, todoList) {
    const id = Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    const todos = todoList.map(todo => ({
      ...todo,
      id: Math.random().toString(36).substr(2, 9) + Date.now().toString(36),
      completed: false
    }));
    const part = {
      id,
      name,
      description,
      active: false,
      todoList: todos,
      createdAt: new Date().toISOString()
    };
    this.parts.set(id, part);
    return part;
  },

  updatePart(id, name, description, todoList) {
    const part = this.parts.get(id);
    if (!part) return null;
    part.name = name;
    part.description = description;
    const updatedTodos = todoList.map(todo => {
      if (todo.id) {
        const existingTodo = part.todoList.find(t => t.id === todo.id);
        if (existingTodo) {
          return { ...existingTodo, ...todo };
        }
      }
      return {
        id: Math.random().toString(36).substr(2, 9) + Date.now().toString(36),
        title: todo.title || '',
        description: todo.description || '',
        completed: todo.completed || false
      };
    });
    part.todoList = updatedTodos;
    this.parts.set(id, part);
    return part;
  },

  deletePart(id) {
    const part = this.parts.get(id);
    if (!part) return null;
    this.parts.delete(id);
    if (this.activePartId === id) {
      this.activePartId = null;
    }
    return part;
  },

  activatePart(id) {
    const part = this.parts.get(id);
    if (!part) return null;
    if (this.activePartId) {
      const currentActive = this.parts.get(this.activePartId);
      if (currentActive) {
        currentActive.active = false;
        this.parts.set(this.activePartId, currentActive);
      }
    }
    part.active = true;
    this.activePartId = id;
    this.parts.set(id, part);
    return part;
  },

  toggleTodoCompletion(partId, todoId) {
    const part = this.parts.get(partId);
    if (!part) return null;
    const todo = part.todoList.find(t => t.id === todoId);
    if (!todo) return null;
    todo.completed = !todo.completed;
    this.parts.set(partId, part);
    return part;
  },

  resetSystem() {
    console.log('🔄 Bắt đầu reset system...');
    
    // Reset tất cả leaders về trạng thái chưa hoàn thành
    console.log(`📊 Resetting ${this.leaders.size} leaders...`);
    this.leaders.forEach((leader, id) => {
      console.log(`  - Resetting leader: ${leader.name} (${id})`);
      leader.completed = false;
      leader.needsHelp = false;
      leader.todoList = []; // Reset todo list của leader
      this.leaders.set(id, leader);
    });

    // Reset tất cả parts về trạng thái không active và reset todos
    console.log(`📋 Resetting ${this.parts.size} parts...`);
    this.parts.forEach((part, id) => {
      console.log(`  - Resetting part: ${part.name} (${id})`);
      part.active = false;
      part.todoList.forEach(todo => {
        todo.completed = false;
      });
      this.parts.set(id, part);
    });

    this.activePartId = null;
    console.log('✅ Reset system hoàn thành!');
    return 'Hệ thống đã được reset thành công';
  },

  getSystemStats() {
    const leaders = Array.from(this.leaders.values());
    return {
      totalLeaders: leaders.length,
      completedLeaders: leaders.filter(l => l.completed).length
    };
  },

  addWebSocketClient(ws) {
    this.wsClients.add(ws);
  },

  removeWebSocketClient(ws) {
    this.wsClients.delete(ws);
  },

  broadcastUpdate(type, data) {
    if (typeof global !== 'undefined' && global.broadcastUpdate) {
      global.broadcastUpdate(type, data);
    }
  },

  // Broadcast all data to all clients
  broadcastAllData() {
    if (global.wsClients) {
      const leaders = this.getLeaders();
      const parts = this.getParts();
      const activePart = this.getActivePart();
      
      // Log detailed info about leaders being broadcasted
      console.log(`🔄 Broadcasting to ${global.wsClients.size} clients:`, {
        leadersCount: leaders.length,
        partsCount: parts.length,
        activePartId: this.activePartId,
        leadersDetails: leaders.map(l => ({ name: l.name, completed: l.completed, needsHelp: l.needsHelp }))
      });
      
      global.wsClients.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          // Send leaders data
          ws.send(JSON.stringify(leaders));
          // Send parts data  
          ws.send(JSON.stringify(parts));
          // Send active part update
          if (activePart) {
            ws.send(JSON.stringify({ type: 'ACTIVE_PART', data: activePart }));
          } else {
            ws.send(JSON.stringify({ type: 'ACTIVE_PART', data: null }));
          }
        }
      });
    }
  }
};

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

// Initialize Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Create WebSocket server
  const wss = new WebSocketServer({ 
    server,
    path: '/ws/updates'
  });

  // WebSocket connection handling
  wss.on('connection', (ws, req) => {
    console.log('WebSocket client connected');
    
    // Store reference to WebSocket in a simple way
    if (!global.wsClients) {
      global.wsClients = new Set();
    }
    global.wsClients.add(ws);

    // Send initial data
    global.db.broadcastAllData();
    const activePart = global.db.getActivePart();
    if (activePart) {
      ws.send(JSON.stringify({ type: 'ACTIVE_PART', data: activePart }));
    }

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      global.wsClients.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      global.wsClients.delete(ws);
    });
  });

  // Broadcast function for database updates
  global.broadcastUpdate = (type, data) => {
    if (global.wsClients) {
      const message = JSON.stringify({ type, data });
      global.wsClients.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(message);
        }
      });
    }
  };

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> WebSocket server running on ws://${hostname}:${port}/ws/updates`);
  });
});

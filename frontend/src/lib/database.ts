import { Leader, Part, TodoItem } from './data';
import WebSocket from 'ws';

// Extend global interface for broadcastUpdate
declare global {
  var broadcastUpdate: ((type: string, data: unknown) => void) | undefined;
}

// In-memory database
class Database {
  private leaders: Map<string, Leader> = new Map();
  private parts: Map<string, Part> = new Map();
  private activePartId: string | null = null;
  private wsClients: Set<WebSocket> = new Set();

  // Leader methods
  getLeaders(): Leader[] {
    return Array.from(this.leaders.values());
  }

  registerLeader(name: string): Leader {
    const id = this.generateId();
    const leader: Leader = {
      id,
      name,
      needsHelp: false,
      completed: false,
      createdAt: new Date().toISOString(),
      todoList: []
    };
    this.leaders.set(id, leader);
    return leader;
  }

  completeLeader(id: string): Leader | null {
    const leader = this.leaders.get(id);
    if (!leader) return null;
    
    leader.completed = true;
    this.leaders.set(id, leader);
    return leader;
  }

  deleteLeader(id: string): Leader | null {
    const leader = this.leaders.get(id);
    if (!leader) return null;
    
    this.leaders.delete(id);
    return leader;
  }

  toggleLeaderHelp(id: string, needsHelp: boolean): Leader | null {
    const leader = this.leaders.get(id);
    if (!leader) return null;
    
    leader.needsHelp = needsHelp;
    this.leaders.set(id, leader);
    return leader;
  }

  toggleLeaderTodo(leaderId: string, todoId: string): { todoId: string; completed: boolean } | null {
    const leader = this.leaders.get(leaderId);
    if (!leader) return null;

    const todo = leader.todoList.find(t => t.id === todoId);
    if (!todo) return null;

    todo.completed = !todo.completed;
    this.leaders.set(leaderId, leader);
    
    return { todoId, completed: todo.completed };
  }

  // Part methods
  getParts(): Part[] {
    return Array.from(this.parts.values());
  }

  getActivePart(): Part | null {
    if (!this.activePartId) return null;
    return this.parts.get(this.activePartId) || null;
  }

  createPart(name: string, description: string, todoList: Omit<TodoItem, 'id' | 'completed'>[]): Part {
    const id = this.generateId();
    const todos: TodoItem[] = todoList.map(todo => ({
      ...todo,
      id: this.generateId(),
      completed: false
    }));

    const part: Part = {
      id,
      name,
      description,
      active: false,
      todoList: todos,
      createdAt: new Date().toISOString()
    };
    
    this.parts.set(id, part);
    return part;
  }

  updatePart(id: string, name: string, description: string, todoList: Partial<TodoItem>[]): Part | null {
    const part = this.parts.get(id);
    if (!part) return null;

    part.name = name;
    part.description = description;
    
    // Update todos
    const updatedTodos: TodoItem[] = todoList.map(todo => {
      if (todo.id) {
        const existingTodo = part.todoList.find(t => t.id === todo.id);
        if (existingTodo) {
          return { ...existingTodo, ...todo } as TodoItem;
        }
      }
      return {
        id: this.generateId(),
        title: todo.title || '',
        description: todo.description || '',
        completed: todo.completed || false
      };
    });
    
    part.todoList = updatedTodos;
    this.parts.set(id, part);
    return part;
  }

  deletePart(id: string): Part | null {
    const part = this.parts.get(id);
    if (!part) return null;
    
    this.parts.delete(id);
    if (this.activePartId === id) {
      this.activePartId = null;
    }
    return part;
  }

  activatePart(id: string): Part | null {
    const part = this.parts.get(id);
    if (!part) return null;

    // Deactivate current active part
    if (this.activePartId) {
      const currentActive = this.parts.get(this.activePartId);
      if (currentActive) {
        currentActive.active = false;
        this.parts.set(this.activePartId, currentActive);
      }
    }

    // Activate new part
    part.active = true;
    this.activePartId = id;
    this.parts.set(id, part);
    
    return part;
  }

  toggleTodoCompletion(partId: string, todoId: string): Part | null {
    const part = this.parts.get(partId);
    if (!part) return null;

    const todo = part.todoList.find(t => t.id === todoId);
    if (!todo) return null;

    todo.completed = !todo.completed;
    this.parts.set(partId, part);
    
    return part;
  }

  // System methods
  resetSystem(): string {
    this.leaders.clear();
    this.parts.clear();
    this.activePartId = null;
    return 'Hệ thống đã được reset thành công';
  }

  getSystemStats(): { totalLeaders: number; completedLeaders: number } {
    const leaders = Array.from(this.leaders.values());
    return {
      totalLeaders: leaders.length,
      completedLeaders: leaders.filter(l => l.completed).length
    };
  }

  // WebSocket methods
  addWebSocketClient(ws: WebSocket): void {
    this.wsClients.add(ws);
  }

  removeWebSocketClient(ws: WebSocket): void {
    this.wsClients.delete(ws);
  }

  broadcastUpdate(type: string, data: unknown): void {
    // Use global broadcast function if available (for server.js)
    if (typeof global !== 'undefined' && global.broadcastUpdate) {
      global.broadcastUpdate(type, data);
    } else {
      // Fallback for direct WebSocket usage
      const message = JSON.stringify({ type, data });
      this.wsClients.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(message);
        }
      });
    }
  }

  // Broadcast all data to all clients
  broadcastAllData(): void {
    const leaders = this.getLeaders();
    const parts = this.getParts();
    
    this.wsClients.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(leaders));
        ws.send(JSON.stringify(parts));
      }
    });
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }
}

// Singleton instance
let dbInstance: Database | null = null;

export function getDatabase(): Database {
  if (!dbInstance) {
    dbInstance = new Database();
  }
  return dbInstance;
}

export interface Leader {
  id: string;
  name: string;
  needsHelp: boolean;
  completed: boolean;
  createdAt: string;
  todoList: TodoItem[];
}

export interface TodoItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export interface Part {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  todoList: TodoItem[];
  createdAt: string;
}

// Interface cho WebSocket messages
export interface WSMessage {
  type: 'LEADER_REGISTERED' | 'LEADER_COMPLETED' | 'LEADER_NEEDS_HELP' | 'LEADER_DELETED' | 'TODO_TOGGLED' | 'PART_ACTIVATED' | 'SYSTEM_RESET';
  data: unknown;
}


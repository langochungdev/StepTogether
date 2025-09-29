'use client';

import { Part } from '../lib/data';

interface TodoListProps {
  part: Part;
  onTodoToggle?: (partId: string, todoId: string) => void;
  editable?: boolean;
}

export default function TodoList({ part, onTodoToggle, editable = false }: TodoListProps) {
  if (!part) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
        <p className="text-gray-500 text-center">Chưa có part nào được kích hoạt</p>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
      <h3 className="text-lg font-semibold text-blue-900 mb-3">
        📋 {part.name} - Todo List
      </h3>
      
      <div className="space-y-3">
        {part.todoList.map((todo) => (
          <div
            key={todo.id}
            className="flex items-start space-x-3 p-3 bg-white rounded-md border border-blue-100"
          >
            <div className="flex-shrink-0 mt-1">
              {editable ? (
                <button
                  onClick={() => onTodoToggle && onTodoToggle(part.id, todo.id)}
                  className="text-lg hover:scale-110 transition-transform"
                >
                  {todo.completed ? (
                    <span className="text-green-500">✅</span>
                  ) : (
                    <span className="text-gray-400 hover:text-green-400">☐</span>
                  )}
                </button>
              ) : (
                <span className="text-lg">
                  {todo.completed ? '✅' : '⏸️'}
                </span>
              )}
            </div>
            <div className="flex-1">
              <h4 className={`font-medium ${todo.completed ? 'text-green-700 line-through' : 'text-gray-800'}`}>
                {todo.title}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {todo.description}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-3 text-sm text-blue-600">
        Tiến trình: {part.todoList.filter(t => t.completed).length}/{part.todoList.length} hoàn thành
      </div>
    </div>
  );
}
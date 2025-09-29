'use client';

import { useState } from 'react';
import { activatePart, createPart, updatePart, deletePart } from '../lib/api';
import { Part } from '../lib/data';

interface PartManagerAdvancedProps {
  parts: Part[];
  onPartActivated?: (part: Part) => void;
  onPartsUpdated?: () => void;
}

export default function PartManagerAdvanced({ parts, onPartActivated, onPartsUpdated }: PartManagerAdvancedProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    todos: [{ id: '', title: '', description: '', completed: false }]
  });

  // Parts are now passed as props, no need to fetch internally

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      todos: [{ id: '', title: '', description: '', completed: false }]
    });
    setEditingPart(null);
    setShowAddForm(false);
  };

  const handleAddTodo = () => {
    setFormData(prev => ({
      ...prev,
      todos: [...prev.todos, { id: '', title: '', description: '', completed: false }]
    }));
  };

  const handleRemoveTodo = (index: number) => {
    setFormData(prev => ({
      ...prev,
      todos: prev.todos.filter((_, i) => i !== index)
    }));
  };

  const handleTodoChange = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      todos: prev.todos.map((todo, i) => 
        i === index ? { ...todo, [field]: value } : todo
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Tên part không được để trống');
      return;
    }

    try {
      setLoading(true);
      
      // Tạo todos với UUID
      const todosWithId = formData.todos.map(todo => ({
        ...todo,
        id: todo.id || crypto.randomUUID()
      }));

      if (editingPart) {
        // Cập nhật part
        await updatePart(editingPart.id, formData.name, formData.description || '', todosWithId);
      } else {
        // Tạo part mới
        await createPart(formData.name, formData.description || '', todosWithId);
      }

      resetForm();
      if (onPartsUpdated) onPartsUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (part: Part) => {
    setEditingPart(part);
    setFormData({
      name: part.name,
      description: part.description || '',
      todos: part.todoList
    });
    setShowAddForm(true);
  };

  const handleDelete = async (partId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa part này?')) return;

    try {
      setLoading(true);
      await deletePart(partId);
      if (onPartsUpdated) onPartsUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleActivatePart = async (partId: string) => {
    setLoading(true);
    setError('');

    try {
      const activatedPart = await activatePart(partId);
      
      if (onPartActivated) {
        onPartActivated(activatedPart);
      }
      // Parts will be updated via WebSocket automatically
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-2">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          🔧 Quản lý Parts
        </h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          ➕ Thêm Part
        </button>
      </div>

      {error && (
        <div className="mb-4 text-red-600 bg-red-50 p-3 rounded-md">
          {error}
        </div>
      )}

      {/* Form thêm/sửa part */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">
            {editingPart ? 'Sửa Part' : 'Thêm Part Mới'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên Part
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-500"
                placeholder="Nhập tên part..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả Part
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-500 h-20 resize-none"
                placeholder="Nhập mô tả part..."
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Todo List
                </label>
                <button
                  type="button"
                  onClick={handleAddTodo}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Thêm Todo
                </button>
              </div>
              
              <div className="space-y-3">
                {formData.todos.map((todo, index) => (
                  <div key={index} className="p-3 bg-white rounded-md border border-gray-200">
                    <div className="flex items-start space-x-2">
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          placeholder="Tiêu đề todo..."
                          value={todo.title}
                          onChange={(e) => handleTodoChange(index, 'title', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-gray-900 bg-white placeholder-gray-500"
                          required
                        />
                        <textarea
                          placeholder="Mô tả chi tiết..."
                          value={todo.description}
                          onChange={(e) => handleTodoChange(index, 'description', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm h-16 resize-none text-gray-900 bg-white placeholder-gray-500"
                          required
                        />
                      </div>
                      {formData.todos.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTodo(index)}
                          className="text-red-600 hover:text-red-800 text-sm mt-1"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Đang xử lý...' : (editingPart ? 'Cập nhật' : 'Tạo Part')}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Danh sách parts */}
      <div className="space-y-3">
        {parts.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            Chưa có part nào. Hãy thêm part đầu tiên!
          </p>
        ) : (
          parts.map((part) => (
            <div
              key={part.id}
              className={`flex items-center justify-between p-4 rounded-lg border ${
                part.active 
                  ? 'bg-blue-50 border-blue-300' 
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex-1">
                <h3 className="font-medium text-gray-800">{part.name}</h3>
                <p className="text-sm text-gray-500">
                  {part.todoList.length} todos - {part.todoList.filter(t => t.completed).length} hoàn thành
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                {part.active ? (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    ✓ Active
                  </span>
                ) : (
                  <button
                    onClick={() => handleActivatePart(part.id)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                  >
                    Kích hoạt
                  </button>
                )}
                
                <button
                  onClick={() => handleEdit(part)}
                  className="px-3 py-1 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700"
                >
                  Sửa
                </button>
                
                <button
                  onClick={() => handleDelete(part.id)}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                >
                  Xóa
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
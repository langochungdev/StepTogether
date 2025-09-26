'use client';

import { useState, useEffect } from 'react';
import { getParts, activatePart } from '../lib/api';
import { Part, TodoItem } from '../lib/data';

interface PartManagerProps {
  onPartActivated?: (part: Part) => void;
  onPartsUpdated?: () => void;
}

export default function PartManager({ onPartActivated, onPartsUpdated }: PartManagerProps) {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    todos: [{ id: '', title: '', description: '', completed: false }]
  });

  useEffect(() => {
    fetchParts();
  }, []);

  const fetchParts = async () => {
    try {
      const fetchedParts = await getParts();
      setParts(fetchedParts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    }
  };

  const handleActivatePart = async (partId: string) => {
    setLoading(true);
    setError('');

    try {
      const activatedPart = await activatePart(partId);
      await fetchParts(); // Refresh parts list
      if (onPartActivated) {
        onPartActivated(activatedPart);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        📚 Quản lý Parts
      </h2>

      {error && (
        <div className="mb-4 text-red-600 text-sm bg-red-50 p-3 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {parts.map((part) => (
          <div
            key={part.id}
            className={`p-4 rounded-lg border-2 transition-all ${
              part.active
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 bg-gray-50 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">{part.name}</h3>
              {part.active && (
                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Đang kích hoạt
                </span>
              )}
            </div>

            <div className="text-sm text-gray-600 mb-3">
              {part.todoList.length} nhiệm vụ
            </div>

            <button
              onClick={() => handleActivatePart(part.id)}
              disabled={loading || part.active}
              className={`w-full py-2 px-4 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                part.active
                  ? 'bg-green-600 text-white cursor-default'
                  : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
              }`}
            >
              {loading ? 'Đang xử lý...' : part.active ? 'Đang kích hoạt' : 'Kích hoạt'}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 text-sm text-gray-500">
        💡 Chỉ có thể kích hoạt 1 part tại một thời điểm. Todo list sẽ hiển thị cho leaders.
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { resetSystem } from '../lib/api';
import { Leader } from '../lib/data';

interface ResetButtonProps {
  onReset: (leaders: Leader[]) => void;
}

export default function ResetButton({ onReset }: ResetButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async () => {
    setLoading(true);
    setError('');

    try {
      await resetSystem();
      // Don't manually reset leaders - let WebSocket update handle it
      // onReset will be called by WebSocket when backend publishes updated data
      setShowConfirm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md border border-red-200">
        <h3 className="text-lg font-semibold text-red-800 mb-3">
          Xác nhận reset
        </h3>
        <p className="text-gray-700 mb-4">
          Bạn có chắc chắn muốn reset tất cả leaders về trạng thái &ldquo;chưa hoàn thành&rdquo;? 
          Leaders sẽ không bị xóa mà chỉ được đặt lại về trạng thái ban đầu.
        </p>
        
        {error && (
          <div className="mb-4 text-red-600 text-sm bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={handleReset}
            disabled={loading}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang reset...' : 'Có, reset tất cả'}
          </button>
          <button
            onClick={() => {
              setShowConfirm(false);
              setError('');
            }}
            disabled={loading}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
          >
            Hủy
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 font-medium"
    >
      🔄 Reset tất cả
    </button>
  );
}
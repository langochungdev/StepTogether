'use client';

import { useState } from 'react';
import { resetSystem } from '../lib/api';

export default function ResetButton() {
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
      <div className="bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg border border-red-600">
        <h3 className="text-base sm:text-lg font-semibold text-red-400 mb-3">
          Xác nhận reset
        </h3>
        <p className="text-gray-300 mb-4 text-sm sm:text-base">
          Bạn có chắc chắn muốn reset tất cả leaders về trạng thái &ldquo;chưa hoàn thành&rdquo;? 
          Leaders sẽ không bị xóa mà chỉ được đặt lại về trạng thái ban đầu.
        </p>
        
        {error && (
          <div className="mb-4 text-red-400 text-sm bg-red-900/20 border border-red-800 p-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleReset}
            disabled={loading}
            className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium min-h-[44px]"
          >
            {loading ? 'Đang reset...' : 'Có, reset tất cả'}
          </button>
          <button
            onClick={() => {
              setShowConfirm(false);
              setError('');
            }}
            disabled={loading}
            className="bg-gray-600 text-white px-6 py-3 rounded-xl hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 font-medium min-h-[44px]"
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
      className="w-full bg-red-600 text-white px-8 py-4 rounded-xl hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 font-medium text-base min-h-[48px] shadow-lg transition-all duration-200"
    >
      🔄 Reset tất cả
    </button>
  );
}
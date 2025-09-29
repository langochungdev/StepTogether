'use client';

import { useState } from 'react';
import { deleteLeader } from '../lib/api';
import { Leader } from '../lib/data';

interface DeleteButtonProps {
  leader: Leader;
  onLeaderDeleted: (deletedLeader: Leader) => void;
}

export default function DeleteButton({ leader, onLeaderDeleted }: DeleteButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setLoading(true);
    setError('');

    try {
      await deleteLeader(leader.id);
      onLeaderDeleted(leader);
      setShowConfirm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg max-w-md w-full border border-gray-700">
          <h3 className="text-base sm:text-lg font-semibold text-red-400 mb-3">
            Xác nhận xóa
          </h3>
          <p className="text-gray-300 mb-4 text-sm sm:text-base">
            Bạn có chắc chắn muốn xóa leader &quot;{leader.name}&quot;?
          </p>
          
          {error && (
            <div className="mb-4 text-red-400 text-sm bg-red-900/20 border border-red-800 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium min-h-[44px]"
            >
              {loading ? 'Đang xóa...' : 'Có, xóa'}
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
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="text-red-400 hover:text-red-300 p-2 sm:p-3 rounded-lg hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
      title="Xóa leader"
    >
      🗑️
    </button>
  );
}
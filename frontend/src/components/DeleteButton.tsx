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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold text-red-800 mb-3">
            Xác nhận xóa
          </h3>
          <p className="text-gray-700 mb-4">
            Bạn có chắc chắn muốn xóa leader &quot;{leader.name}&quot;?
          </p>
          
          {error && (
            <div className="mb-4 text-red-600 text-sm bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang xóa...' : 'Có, xóa'}
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
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      title="Xóa leader"
    >
      🗑️
    </button>
  );
}
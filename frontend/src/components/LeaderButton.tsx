'use client';

import { useState } from 'react';
import { completeLeader } from '../lib/api';
import { Leader } from '../lib/data';

interface LeaderButtonProps {
  leader: Leader;
  onLeaderCompleted: (leader: Leader) => void;
}

export default function LeaderButton({ leader, onLeaderCompleted }: LeaderButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleComplete = async () => {
    setLoading(true);
    setError('');

    try {
      const updatedLeader = await completeLeader(leader.id);
      onLeaderCompleted(updatedLeader);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  if (leader.completed) {
    return (
      <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
        <div className="text-green-600 text-2xl mb-2">✅</div>
        <h3 className="text-lg font-semibold text-green-800 mb-2">
          Xin chào, {leader.name}!
        </h3>
        <p className="text-green-600">Bạn đã hoàn thành nhiệm vụ</p>
      </div>
    );
  }

  return (
    <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
      <h3 className="text-lg font-semibold text-blue-800 mb-4">
        Xin chào, {leader.name}!
      </h3>
      
      {error && (
        <div className="mb-4 text-red-600 text-sm bg-red-50 p-3 rounded-md">
          {error}
        </div>
      )}

      <button
        onClick={handleComplete}
        disabled={loading}
        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium"
      >
        {loading ? 'Đang xử lý...' : 'Hoàn thành'}
      </button>
      
      <p className="text-gray-600 text-sm mt-3">
        Nhấn nút khi bạn đã hoàn thành nhiệm vụ
      </p>
    </div>
  );
}
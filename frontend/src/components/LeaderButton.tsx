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
      <button className="w-full bg-green-600 text-white px-6 py-4 sm:py-5 rounded-xl font-semibold text-base sm:text-lg shadow-lg min-h-[52px] cursor-default">
        <span className="flex items-center justify-center gap-2">
          <span>✅</span>
          <span>Đã hoàn thành</span>
        </span>
      </button>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="text-red-400 text-sm bg-red-900/20 border border-red-800 p-3 rounded-lg text-center">
          {error}
        </div>
      )}

      <button
        onClick={handleComplete}
        disabled={loading}
        className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-4 sm:py-5 rounded-xl font-semibold text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all duration-200 min-h-[52px]"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-b-transparent"></div>
            <span>Đang xử lý...</span>
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <span>✅</span>
            <span>Hoàn thành nhiệm vụ</span>
          </span>
        )}
      </button>
      
      <p className="text-gray-400 text-sm text-center px-2">
        Nhấn nút khi bạn đã hoàn thành nhiệm vụ
      </p>
    </div>
  );
}
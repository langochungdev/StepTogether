'use client';

import { useState } from 'react';
import { toggleLeaderHelp } from '../lib/api';
import { Leader } from '../lib/data';

interface HelpButtonProps {
  leader: Leader;
  onHelpToggled: (leader: Leader) => void;
}

export default function HelpButton({ leader, onHelpToggled }: HelpButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleToggleHelp = async () => {
    setLoading(true);
    setError('');

    try {
      const updatedLeader = await toggleLeaderHelp(leader.id, !leader.needsHelp);
      onHelpToggled(updatedLeader);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="text-red-400 text-sm bg-red-900/20 border border-red-800 p-3 rounded-lg text-center">
          {error}
        </div>
      )}

      <button
        onClick={handleToggleHelp}
        disabled={loading}
        className={`w-full px-6 py-4 sm:py-5 rounded-xl font-semibold text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all duration-200 min-h-[52px] ${
          leader.needsHelp
            ? 'bg-orange-600 text-white hover:bg-orange-700 focus:ring-orange-500'
            : 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500'
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-b-transparent"></div>
            <span>Đang xử lý...</span>
          </span>
        ) : leader.needsHelp ? (
          <span className="flex items-center justify-center gap-2">
            <span>🆘</span>
            <span>Đã yêu cầu hỗ trợ</span>
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <span>🙋‍♂️</span>
            <span>Cần hỗ trợ</span>
          </span>
        )}
      </button>

      {leader.needsHelp && (
        <p className="text-sm text-orange-400 text-center px-2">
          Yêu cầu hỗ trợ đã được gửi đến giảng viên
        </p>
      )}
    </div>
  );
}
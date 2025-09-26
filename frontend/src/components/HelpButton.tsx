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
    <div className="space-y-2">
      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-2 rounded-md">
          {error}
        </div>
      )}

      <button
        onClick={handleToggleHelp}
        disabled={loading}
        className={`px-4 py-2 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
          leader.needsHelp
            ? 'bg-orange-600 text-white hover:bg-orange-700 focus:ring-orange-500'
            : 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500'
        }`}
      >
        {loading ? (
          'Đang xử lý...'
        ) : leader.needsHelp ? (
          '🆘 Đã yêu cầu hỗ trợ'
        ) : (
          '🙋‍♂️ Cần hỗ trợ'
        )}
      </button>

      {leader.needsHelp && (
        <p className="text-sm text-orange-600">
          Yêu cầu hỗ trợ đã được gửi đến giảng viên
        </p>
      )}
    </div>
  );
}
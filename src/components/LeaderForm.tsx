'use client';

import { useState } from 'react';
import { registerLeader } from '../lib/api';
import { Leader } from '../lib/data';

interface LeaderFormProps {
  onLeaderRegistered: (leader: Leader) => void;
}

export default function LeaderForm({ onLeaderRegistered }: LeaderFormProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Vui lòng nhập tên leader');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const newLeader = await registerLeader(name.trim());
      onLeaderRegistered(newLeader);
      setName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full mb-4">
          <span className="text-xl sm:text-2xl">✨</span>
        </div>
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 px-2">
          Bắt đầu hành trình của bạn
        </h2>
        <p className="text-gray-300 text-sm sm:text-base px-2">
          Nhập tên để tham gia cùng chúng tôi
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm sm:text-base font-medium text-gray-300 mb-3">
            <span className="flex items-center gap-2">
              <span>👤</span>
              <span>Tên của bạn</span>
            </span>
          </label>
          <div className="relative">
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-4 sm:py-5 text-base sm:text-lg border-2 border-gray-600 bg-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 placeholder:text-gray-400 min-h-[48px]"
              placeholder="Nhập tên của bạn..."
              disabled={loading}
              autoComplete="name"
              maxLength={50}
            />
            {name.trim() && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-400 text-lg">
                ✓
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-900/20 border-2 border-red-800 rounded-xl p-4 text-center">
            <span className="text-red-400 text-xl mb-2 block">⚠️</span>
            <p className="text-red-300 font-medium text-sm sm:text-base">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-4 sm:py-5 px-6 rounded-xl font-semibold text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg min-h-[52px]"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-b-transparent"></div>
              <span>Đang đăng ký...</span>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <span>🚀</span>
              <span>Bắt đầu ngay</span>
            </span>
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-xs md:text-sm text-gray-500">
          Bằng cách đăng ký, bạn đồng ý tham gia hành trình cùng chúng tôi
        </p>
      </div>
    </div>
  );
}
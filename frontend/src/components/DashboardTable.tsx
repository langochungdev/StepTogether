'use client';

import { Leader } from '../lib/data';
import DeleteButton from './DeleteButton';

interface DashboardTableProps {
  leaders: Leader[];
  onLeaderDeleted: (deletedLeader: Leader) => void;
}

export default function DashboardTable({ leaders, onLeaderDeleted }: DashboardTableProps) {
  const pendingLeaders = leaders.filter(leader => !leader.completed);
  const doneLeaders = leaders.filter(leader => leader.completed);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
      {/* Cột trái - Chưa hoàn thành */}
      <div className="order-1">
        <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-t-xl p-4">
          <h2 className="text-lg md:text-xl font-bold text-white flex items-center">
            <span className="w-4 h-4 bg-white rounded-full mr-3 opacity-90"></span>
            <span>Chưa hoàn thành</span>
            <span className="ml-3 bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-semibold">
              {pendingLeaders.length}
            </span>
          </h2>
        </div>
        
        <div className="bg-gray-800 rounded-b-xl border border-gray-700 p-4 md:p-6 min-h-[300px] lg:min-h-[400px]">
          {pendingLeaders.length === 0 ? (
            <div className="text-center py-8 lg:py-12">
              <div className="text-4xl lg:text-5xl mb-4">🎉</div>
              <p className="text-gray-400 font-medium text-base lg:text-lg">Tất cả đã hoàn thành!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingLeaders.map((leader) => (
                <div
                  key={leader.id}
                  className={`p-4 lg:p-5 rounded-xl border-2 transition-all hover:shadow-lg ${
                    leader.needsHelp 
                      ? 'bg-gradient-to-r from-orange-900/30 to-red-900/30 border-orange-600 hover:border-orange-500' 
                      : 'bg-gradient-to-r from-red-900/30 to-pink-900/30 border-red-600 hover:border-red-500'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col gap-2 mb-3">
                        <h3 className="font-bold text-white text-lg lg:text-xl break-words">
                          {leader.name}
                        </h3>
                        {leader.needsHelp && (
                          <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap">
                            🆘 Cần hỗ trợ
                          </span>
                        )}
                      </div>
                      <div className="space-y-1 text-xs sm:text-sm text-gray-400">
                        <p>📅 {new Date(leader.createdAt).toLocaleString('vi-VN')}</p>
                        {leader.todoList && leader.todoList.length > 0 && (
                          <p className="text-blue-400 font-medium text-sm lg:text-base">
                            📋 {leader.todoList.filter(t => t.completed).length}/{leader.todoList.length} mục hoàn thành
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl lg:text-3xl">
                        {leader.needsHelp ? '🆘' : '⏳'}
                      </div>
                      <DeleteButton leader={leader} onLeaderDeleted={onLeaderDeleted} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cột phải - Đã hoàn thành */}
      <div className="order-2 lg:order-1">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-t-xl p-4">
          <h2 className="text-lg md:text-xl font-bold text-white flex items-center">
            <span className="w-4 h-4 bg-white rounded-full mr-3 opacity-90"></span>
            <span>Đã hoàn thành</span>
            <span className="ml-3 bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-semibold">
              {doneLeaders.length}
            </span>
          </h2>
        </div>
        
        <div className="bg-gray-800 rounded-b-xl border border-gray-700 p-4 md:p-6 min-h-[300px] lg:min-h-[400px]">
          {doneLeaders.length === 0 ? (
            <div className="text-center py-8 lg:py-12">
              <div className="text-4xl lg:text-5xl mb-4">⏳</div>
              <p className="text-gray-400 font-medium text-base lg:text-lg">Chưa có ai hoàn thành</p>
            </div>
          ) : (
            <div className="space-y-4">
              {doneLeaders.map((leader) => (
                <div
                  key={leader.id}
                  className="p-4 lg:p-5 bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-xl border-2 border-green-600 hover:border-green-500 transition-all hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white text-lg lg:text-xl mb-3 break-words">
                        {leader.name}
                      </h3>
                      <div className="space-y-1 text-sm lg:text-base text-gray-400">
                        <p>📅 {new Date(leader.createdAt).toLocaleString('vi-VN')}</p>
                        {leader.todoList && leader.todoList.length > 0 && (
                          <p className="text-green-400 font-medium">
                            📋 {leader.todoList.filter(t => t.completed).length}/{leader.todoList.length} mục hoàn thành
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-green-400 text-2xl lg:text-3xl">✅</div>
                      <DeleteButton leader={leader} onLeaderDeleted={onLeaderDeleted} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
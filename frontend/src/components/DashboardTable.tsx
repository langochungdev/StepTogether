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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
      {/* Cột trái: Chưa hoàn thành */}
      <div className="order-1">
        <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-t-xl p-3 md:p-4">
          <h2 className="text-lg md:text-xl font-bold text-white flex items-center">
            <span className="w-3 h-3 md:w-4 md:h-4 bg-white rounded-full mr-2 opacity-90"></span>
            <span>Chưa hoàn thành</span>
            <span className="ml-2 bg-white bg-opacity-20 px-2 py-1 rounded-full text-sm">
              {pendingLeaders.length}
            </span>
          </h2>
        </div>
        
        <div className="bg-white rounded-b-xl border-l border-r border-b border-gray-100 p-4 md:p-6 min-h-[200px]">
          {pendingLeaders.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">🎉</div>
              <p className="text-gray-500 font-medium">Tất cả đã hoàn thành!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingLeaders.map((leader) => (
                <div
                  key={leader.id}
                  className={`p-3 md:p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                    leader.needsHelp 
                      ? 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-200 hover:border-orange-300' 
                      : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200 hover:border-red-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <h3 className="font-bold text-gray-800 text-base md:text-lg truncate">
                          {leader.name}
                        </h3>
                        {leader.needsHelp && (
                          <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap">
                            🆘 Cần hỗ trợ
                          </span>
                        )}
                      </div>
                      <div className="space-y-1 text-xs md:text-sm text-gray-600">
                        <p>📅 {new Date(leader.createdAt).toLocaleString('vi-VN')}</p>
                        {leader.todoList && leader.todoList.length > 0 && (
                          <p className="text-blue-600 font-medium">
                            📋 {leader.todoList.filter(t => t.completed).length}/{leader.todoList.length} mục hoàn thành
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-3">
                      <div className="text-2xl">
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

      {/* Cột phải: Đã hoàn thành */}
      <div className="order-2">
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-t-xl p-3 md:p-4">
          <h2 className="text-lg md:text-xl font-bold text-white flex items-center">
            <span className="w-3 h-3 md:w-4 md:h-4 bg-white rounded-full mr-2 opacity-90"></span>
            <span>Đã hoàn thành</span>
            <span className="ml-2 bg-white bg-opacity-20 px-2 py-1 rounded-full text-sm">
              {doneLeaders.length}
            </span>
          </h2>
        </div>
        
        <div className="bg-white rounded-b-xl border-l border-r border-b border-gray-100 p-4 md:p-6 min-h-[200px]">
          {doneLeaders.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">⏳</div>
              <p className="text-gray-500 font-medium">Chưa có ai hoàn thành</p>
            </div>
          ) : (
            <div className="space-y-3">
              {doneLeaders.map((leader) => (
                <div
                  key={leader.id}
                  className="p-3 md:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 hover:border-green-300 transition-all hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 text-base md:text-lg mb-2 truncate">
                        {leader.name}
                      </h3>
                      <div className="space-y-1 text-xs md:text-sm text-gray-600">
                        <p>📅 {new Date(leader.createdAt).toLocaleString('vi-VN')}</p>
                        {leader.todoList && leader.todoList.length > 0 && (
                          <p className="text-green-600 font-medium">
                            📋 {leader.todoList.filter(t => t.completed).length}/{leader.todoList.length} mục hoàn thành
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-3">
                      <div className="text-green-500 text-2xl">✅</div>
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
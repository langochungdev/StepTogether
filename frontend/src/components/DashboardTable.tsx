'use client';

import { Leader, Part } from '../lib/data';
import DeleteButton from './DeleteButton';

interface DashboardTableProps {
  leaders: Leader[];
  onLeaderDeleted: (deletedLeader: Leader) => void;
  activePart?: Part | null;
}

export default function DashboardTable({ leaders, onLeaderDeleted, activePart }: DashboardTableProps) {
  const pendingLeaders = leaders.filter(leader => !leader.completed);
  const doneLeaders = leaders.filter(leader => leader.completed);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Cột trái: Chưa hoàn thành */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-red-600 mb-4 flex items-center">
          <span className="w-4 h-4 bg-red-500 rounded-full mr-2"></span>
          Chưa hoàn thành ({pendingLeaders.length})
        </h2>
        
        {pendingLeaders.length === 0 ? (
          <p className="text-gray-500 italic">Tất cả đã hoàn thành! 🎉</p>
        ) : (
          <div className="space-y-3">
            {pendingLeaders.map((leader) => (
              <div
                key={leader.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  leader.needsHelp 
                    ? 'bg-orange-50 border-orange-200' 
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-gray-800">{leader.name}</h3>
                    {leader.needsHelp && (
                      <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                        Cần hỗ trợ
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    Đăng ký: {new Date(leader.createdAt).toLocaleString('vi-VN')}
                  </p>
                  {leader.todoList && leader.todoList.length > 0 && (
                    <div className="text-sm text-blue-600 mt-1">
                      📋 Tiến trình: {leader.todoList.filter(t => t.completed).length}/{leader.todoList.length} mục
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-xl">
                    {leader.needsHelp ? '🆘' : '⏳'}
                  </div>
                  <DeleteButton leader={leader} onLeaderDeleted={onLeaderDeleted} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cột phải: Đã hoàn thành */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-green-600 mb-4 flex items-center">
          <span className="w-4 h-4 bg-green-500 rounded-full mr-2"></span>
          Đã hoàn thành ({doneLeaders.length})
        </h2>
        
        {doneLeaders.length === 0 ? (
          <p className="text-gray-500 italic">Chưa có ai hoàn thành</p>
        ) : (
          <div className="space-y-3">
            {doneLeaders.map((leader) => (
              <div
                key={leader.id}
                className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
              >
                <div>
                  <h3 className="font-medium text-gray-800">{leader.name}</h3>
                  <div className="text-sm text-gray-500">
                    <p>Đăng ký: {new Date(leader.createdAt).toLocaleString('vi-VN')}</p>
                    {leader.todoList && leader.todoList.length > 0 && (
                      <p className="text-blue-600 mt-1">
                        📋 Tiến trình: {leader.todoList.filter(t => t.completed).length}/{leader.todoList.length} mục
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-green-500 text-xl">✅</div>
                  <DeleteButton leader={leader} onLeaderDeleted={onLeaderDeleted} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
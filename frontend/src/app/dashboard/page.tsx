'use client';

import { useEffect, useState } from 'react';
import DashboardTable from '../../components/DashboardTable';
import ResetButton from '../../components/ResetButton';
import PartManagerAdvanced from '../../components/PartManagerAdvanced';
import { Leader, Part } from '../../lib/data';
import { getLeaders, getParts, getActivePart } from '../../lib/api';
import { WebSocketClient } from '../../lib/websocket-client';

export default function DashboardPage() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activePart, setActivePart] = useState<Part | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load initial data from API
    const loadData = async () => {
      try {
        setLoading(true);
        const [leadersData, partsData, activePartData] = await Promise.all([
          getLeaders(),
          getParts(),
          getActivePart()
        ]);
        
        setLeaders(leadersData);
        setParts(partsData);
        setActivePart(activePartData);
        setError('');
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Có lỗi khi tải dữ liệu');
        setLoading(false);
      }
    };

    loadData();

    // Setup WebSocket connection
    const wsClient = new WebSocketClient(
      (leaders) => {
        console.log('📥 Received leaders update:', leaders);
        setLeaders(leaders);
      },
      (parts) => {
        console.log('📥 Received parts update:', parts);
        setParts(parts);
      },
      (activePart) => {
        console.log('📥 Received active part update:', activePart);
        setActivePart(activePart);
      }
    );

    wsClient.connect();

    return () => {
      wsClient.disconnect();
    };
  }, []);

  const handlePartActivated = (part: Part) => {
    console.log('Part activated:', part.name);
    // Có thể gửi event ngược lên server nếu cần:
    // socket.send(JSON.stringify({ type: 'PART_ACTIVATE', payload: part }));
  };

  const handleLeaderDeleted = (deletedLeader: Leader) => {
    setLeaders(prev => prev.filter(l => l.id !== deletedLeader.id));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-white border-b-transparent"></div>
          </div>
          <h2 className="text-2xl font-semibold text-white mb-3">Đang tải dữ liệu...</h2>
          <p className="text-lg text-gray-400">Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section - Desktop optimized */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6">
              <span className="text-4xl">🚀</span>
            </div>
            <h1 className="text-5xl font-bold text-white mb-6">
              Không để ai bị bỏ lại phía sau
            </h1>
            <p className="text-gray-300 text-xl max-w-3xl mx-auto leading-relaxed">
              Theo dõi trạng thái hoàn thành của tất cả leaders và hỗ trợ nhau cùng tiến bộ
            </p>
          </div>

          {error && (
            <div className="mb-8 mx-auto max-w-lg">
              <div className="bg-red-900/20 border border-red-800 rounded-xl p-6 text-center">
                <div className="text-red-400 text-3xl mb-3">⚠️</div>
                <p className="text-red-300 font-medium text-lg">{error}</p>
              </div>
            </div>
          )}

          {/* Stats Cards - Desktop optimized */}
          <div className="grid grid-cols-3 gap-8 mb-12">
            <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8 text-center hover:bg-gray-750 transition-colors">
              <div className="text-5xl mb-4">👥</div>
              <div className="text-4xl font-bold text-white mb-2">{leaders?.length || 0}</div>
              <div className="text-lg text-gray-400">Tổng số Leaders</div>
            </div>
            <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8 text-center hover:bg-gray-750 transition-colors">
              <div className="text-5xl mb-4">✅</div>
              <div className="text-4xl font-bold text-green-400 mb-2">{leaders?.filter(l => l.completed)?.length || 0}</div>
              <div className="text-lg text-gray-400">Đã hoàn thành</div>
            </div>
            <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8 text-center hover:bg-gray-750 transition-colors">
              <div className="text-5xl mb-4">⏳</div>
              <div className="text-4xl font-bold text-yellow-400 mb-2">{leaders?.filter(l => !l.completed)?.length || 0}</div>
              <div className="text-lg text-gray-400">Đang thực hiện</div>
            </div>
          </div>

          {/* Part Manager - Desktop optimized */}
          <div className="mb-12">
            <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                <h2 className="text-white font-semibold text-2xl flex items-center gap-3">
                  <span>🎯</span>
                  <span>Quản lý nhiệm vụ</span>
                </h2>
              </div>
              <div className="p-8">
                <PartManagerAdvanced 
                  parts={parts}
                  onPartActivated={handlePartActivated}
                  onPartsUpdated={() => {}}
                />
              </div>
            </div>
          </div>

          {/* Dashboard Table - Desktop optimized */}
          <div className="mb-12">
            <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6">
                <h2 className="text-white font-semibold text-2xl flex items-center gap-3">
                  <span>📊</span>
                  <span>Bảng theo dõi tiến độ</span>
                </h2>
              </div>
              <div className="p-8">
                <DashboardTable 
                  leaders={leaders} 
                  onLeaderDeleted={handleLeaderDeleted}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons - Desktop optimized */}
          <div className="flex justify-center gap-6 mb-12">
            <ResetButton />
            
            <a
              href="/leader"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-12 py-4 rounded-xl hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 font-semibold shadow-xl transition-all duration-200 text-center inline-flex items-center justify-center text-lg gap-3 hover:scale-105"
            >
              <span>👥</span>
              <span>Trang Leader</span>
            </a>
          </div>

          {/* Footer Info - Desktop optimized */}
          <div className="text-center">
            <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8 max-w-lg mx-auto shadow-xl">
              <div className="text-4xl mb-6">🔄</div>
              <p className="text-white font-semibold mb-4 text-xl">Dữ liệu realtime qua WebSocket</p>
              <div className="text-base text-gray-400 space-y-2">
                <div className="flex justify-between items-center">
                  <span>🎯 Tổng:</span>
                  <span className="font-semibold text-white text-xl">{leaders?.length || 0} leaders</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>✅ Hoàn thành:</span>
                  <span className="font-semibold text-green-400 text-xl">{leaders?.filter(l => l.completed)?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>⏳ Đang thực hiện:</span>
                  <span className="font-semibold text-yellow-400 text-xl">{leaders?.filter(l => !l.completed)?.length || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

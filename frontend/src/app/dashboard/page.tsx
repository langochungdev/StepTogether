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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-b-transparent"></div>
          </div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Đang tải dữ liệu...</h2>
          <p className="text-sm text-gray-600">Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
              <span className="text-2xl">🚀</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
              Không để ai bị bỏ lại phía sau
            </h1>
            <p className="text-gray-600 text-sm md:text-lg max-w-2xl mx-auto">
              Theo dõi trạng thái hoàn thành của tất cả leaders và hỗ trợ nhau cùng tiến bộ
            </p>
          </div>

          {error && (
            <div className="mb-6 mx-auto max-w-md">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <div className="text-red-500 text-2xl mb-2">⚠️</div>
                <p className="text-red-600 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
              <div className="text-3xl mb-2">👥</div>
              <div className="text-2xl font-bold text-gray-800">{leaders?.length || 0}</div>
              <div className="text-sm text-gray-600">Tổng số Leaders</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
              <div className="text-3xl mb-2">✅</div>
              <div className="text-2xl font-bold text-green-600">{leaders?.filter(l => l.completed)?.length || 0}</div>
              <div className="text-sm text-gray-600">Đã hoàn thành</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
              <div className="text-3xl mb-2">⏳</div>
              <div className="text-2xl font-bold text-yellow-600">{leaders?.filter(l => !l.completed)?.length || 0}</div>
              <div className="text-sm text-gray-600">Đang thực hiện</div>
            </div>
          </div>

          {/* Part Manager */}
          <div className="mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4">
                <h2 className="text-white font-semibold text-lg">🎯 Quản lý nhiệm vụ</h2>
              </div>
              <div className="p-6">
                <PartManagerAdvanced 
                  parts={parts}
                  onPartActivated={handlePartActivated}
                  onPartsUpdated={() => {}}
                />
              </div>
            </div>
          </div>

          {/* Dashboard Table */}
          <div className="mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-blue-600 p-4">
                <h2 className="text-white font-semibold text-lg">📊 Bảng theo dõi tiến độ</h2>
              </div>
              <div className="p-6">
                <DashboardTable 
                  leaders={leaders} 
                  onLeaderDeleted={handleLeaderDeleted}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <ResetButton />
            
            <a
              href="/leader"
              className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-purple-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 font-medium shadow-lg transition-all duration-200 text-center inline-flex items-center justify-center"
            >
              👥 Trang Leader
            </a>
          </div>

          {/* Footer Info */}
          <div className="text-center">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-md mx-auto">
              <div className="text-2xl mb-3">🔄</div>
              <p className="text-gray-600 font-medium mb-2">Dữ liệu realtime qua WebSocket</p>
              <div className="text-sm text-gray-500 space-y-1">
                <div>🎯 Tổng: <span className="font-semibold">{leaders?.length || 0}</span> leaders</div>
                <div>✅ Hoàn thành: <span className="font-semibold text-green-600">{leaders?.filter(l => l.completed)?.length || 0}</span></div>
                <div>⏳ Đang thực hiện: <span className="font-semibold text-yellow-600">{leaders?.filter(l => !l.completed)?.length || 0}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

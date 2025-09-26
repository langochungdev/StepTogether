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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Dashboard - Tổng hợp tiến trình
            </h1>
            <p className="text-gray-600">
              Theo dõi trạng thái hoàn thành của tất cả leaders
            </p>
          </div>

          {error && (
            <div className="mb-6 text-red-600 text-center bg-red-50 p-4 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <PartManagerAdvanced 
            parts={parts}
            onPartActivated={handlePartActivated}
            onPartsUpdated={() => {}} // không cần fetchData nữa
          />

          <div className="mb-8">
            <DashboardTable 
              leaders={leaders} 
              onLeaderDeleted={handleLeaderDeleted}
            />
          </div>

          <div className="flex justify-center space-x-4">
            <ResetButton />
            
            <a
              href="/leader"
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-medium"
            >
              👥 Trang Leader
            </a>
          </div>

          <div className="mt-8 text-center text-gray-500">
            <p>Dữ liệu realtime qua WebSocket</p>
            <p className="text-sm mt-1">
              Tổng: {leaders?.length || 0} leaders - 
              Hoàn thành: {leaders?.filter(l => l.completed)?.length || 0} - 
              Chờ: {leaders?.filter(l => !l.completed)?.length || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

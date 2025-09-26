'use client';

import { useEffect, useState } from 'react';
import DashboardTable from '../../components/DashboardTable';
import ResetButton from '../../components/ResetButton';
import PartManagerAdvanced from '../../components/PartManagerAdvanced';
import { Leader, Part } from '../../lib/data';
import { getLeaders, getParts, getActivePart } from '../../lib/api';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

export default function DashboardPage() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
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

    // Try to setup WebSocket (optional)
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws/updates'),
      debug: (str) => console.log('STOMP:', str),
      onConnect: () => {
        console.log('✅ STOMP connected');

        // Subscribe to topics
        client.subscribe('/topic/leaders', (message) => {
          try {
            console.log('📥 Received leaders WebSocket message:', message.body);
            const data = JSON.parse(message.body);
            if (Array.isArray(data)) {
              console.log('✅ Setting leaders data:', data);
              setLeaders(data);
            } else {
              console.warn('Leaders data is not an array:', data);
            }
          } catch (err) {
            console.error('Error parsing leaders message:', err);
          }
        });

        client.subscribe('/topic/parts', (message) => {
          try {
            console.log('📥 Received parts WebSocket message:', message.body);
            console.log('📥 Message type:', typeof message.body);
            const partsData = JSON.parse(message.body);
            console.log('📥 Parsed data:', partsData);
            console.log('📥 Is array?', Array.isArray(partsData));
            if (Array.isArray(partsData)) {
              console.log('✅ Setting parts data:', partsData);
              setParts(partsData);
              const activePartFound = partsData.find((p: Part) => p.active);
              console.log('✅ Active part found:', activePartFound);
              setActivePart(activePartFound || null);
            } else {
              console.warn('❌ Parts data is not an array:', partsData);
            }
          } catch (err) {
            console.error('❌ Error parsing parts message:', err);
          }
        });

        client.subscribe('/topic/system', (message) => {
          try {
            const data = JSON.parse(message.body);
            console.log('System update:', data);
          } catch (err) {
            console.error('Error parsing system message:', err);
          }
        });
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
        // Don't set error state for WebSocket failures
      },
      onWebSocketClose: () => {
        console.log('❌ WebSocket disconnected');
      }
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, []);

  const handleReset = (updatedLeaders: Leader[]) => {
    setLeaders(updatedLeaders);
  };

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
              activePart={activePart}
            />
          </div>

          <div className="flex justify-center space-x-4">
            <ResetButton onReset={handleReset} />
            
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

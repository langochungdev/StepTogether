'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import LeaderForm from '../../components/LeaderForm';
import LeaderButton from '../../components/LeaderButton';
import HelpButton from '../../components/HelpButton';
import TodoList from '../../components/TodoList';
import { toggleTodoCompletion, getLeaders, getActivePart } from '../../lib/api';
import { Leader, Part } from '../../lib/data';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

function LeaderPageContent() {
  const [currentLeader, setCurrentLeader] = useState<Leader | null>(null);
  const [activePart, setActivePart] = useState<Part | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const searchParams = useSearchParams();
  const leaderName = searchParams.get('name');

  useEffect(() => {
    // Set loading timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      setLoading(false);
      setError('Timeout: Không thể kết nối đến server');
    }, 10000); // 10 seconds timeout

    // Load initial data from API
    const loadData = async () => {
      try {
        setLoading(true);
        const [leadersData, activePartData] = await Promise.all([
          getLeaders(),
          getActivePart()
        ]);
        
        // Clear timeout if successful
        clearTimeout(loadingTimeout);
        
        // Find current leader by name from URL
        if (leaderName) {
          const existingLeader = leadersData.find(
            (leader: Leader) => leader.name === leaderName
          );
          if (existingLeader) {
            setCurrentLeader(existingLeader);
          }
        }
        
        setActivePart(activePartData);
        setError('');
        setLoading(false);
      } catch (err) {
        clearTimeout(loadingTimeout);
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
            const leadersData = JSON.parse(message.body);
            // Find current leader by name from URL
            if (Array.isArray(leadersData) && leaderName) {
              const existingLeader = leadersData.find(
                (leader: Leader) => leader.name === leaderName
              );
              if (existingLeader) {
                setCurrentLeader(existingLeader);
              } else if (currentLeader) {
                // Leader đã bị xóa → reset
                setCurrentLeader(null);
                const url = new URL(window.location.href);
                url.searchParams.delete('name');
                window.history.replaceState({}, '', url.toString());
              }
            } else if (!Array.isArray(leadersData)) {
              console.warn('Leaders data is not an array:', leadersData);
            }
          } catch (err) {
            console.error('Error parsing leaders message:', err);
          }
        });

        client.subscribe('/topic/parts', (message) => {
          try {
            const parts = JSON.parse(message.body);
            if (Array.isArray(parts)) {
              const activePartFound = parts.find((p: Part) => p.active);
              setActivePart(activePartFound || null);
            } else {
              console.warn('Parts data is not an array:', parts);
            }
          } catch (err) {
            console.error('Error parsing parts message:', err);
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
      clearTimeout(loadingTimeout);
      client.deactivate();
    };
  }, [leaderName]);

  const handleLeaderRegistered = (leader: Leader) => {
    setCurrentLeader(leader);
    const url = new URL(window.location.href);
    url.searchParams.set('name', leader.name);
    window.history.replaceState({}, '', url.toString());
  };

  const handleLeaderCompleted = (leader: Leader) => {
    setCurrentLeader(leader);
  };

  const handleHelpToggled = (leader: Leader) => {
    setCurrentLeader(leader);
  };

  const handleTodoToggle = async (partId: string, todoId: string) => {
    try {
      await toggleTodoCompletion(partId, todoId);
      // Trường hợp server có cơ chế push thì không cần fetch lại.
      // ActivePart sẽ được cập nhật từ sự kiện PARTS_UPDATE qua WS.
    } catch (err) {
      console.error('Error toggling todo:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
    <div className="container mx-auto px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            StepTogether - Trang Leader
          </h1>
          <p className="text-gray-600">
            Đăng ký và theo dõi tiến trình hoàn thành nhiệm vụ
          </p>
        </div>

        {/* ✅ Hiển thị lỗi nếu có */}
        {error && (
          <div className="mb-6 text-red-600 text-center bg-red-50 p-4 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Hiển thị TodoList nếu có part active */}
        {activePart && (
          <TodoList 
            part={activePart} 
            editable={true}
            onTodoToggle={handleTodoToggle}
          />
        )}

        {!currentLeader ? (
          <LeaderForm onLeaderRegistered={handleLeaderRegistered} />
        ) : (
          <div className="space-y-6">
            <div className="flex space-x-4 justify-center">
              <LeaderButton 
                leader={currentLeader} 
                onLeaderCompleted={handleLeaderCompleted} 
              />
              <HelpButton 
                leader={currentLeader}
                onHelpToggled={handleHelpToggled}
              />
            </div>
            
            <div className="text-center">
              <a
                href="/leader"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Đăng ký leader khác
              </a>
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <a
            href="/dashboard"
            className="inline-flex items-center text-gray-600 hover:text-gray-800"
          >
            📊 Xem trang tổng hợp
          </a>
        </div>
      </div>
    </div>
  </div>
);

}

export default function LeaderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    }>
      <LeaderPageContent />
    </Suspense>
  );
}

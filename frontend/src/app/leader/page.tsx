'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import LeaderForm from '../../components/LeaderForm';
import LeaderButton from '../../components/LeaderButton';
import HelpButton from '../../components/HelpButton';
import TodoList from '../../components/TodoList';
import { toggleTodoCompletion, getLeaders, getActivePart } from '../../lib/api';
import { Leader, Part } from '../../lib/data';
import { WebSocketClient } from '../../lib/websocket-client';

function LeaderPageContent() {
  const [currentLeader, setCurrentLeader] = useState<Leader | null>(null);
  const [activePart, setActivePart] = useState<Part | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [displaySyncTime, setDisplaySyncTime] = useState<number>(0);
  const lastSyncTimeRef = useRef<number>(0);
  const currentLeaderRef = useRef<Leader | null>(null);
  const searchParams = useSearchParams();
  const leaderName = searchParams.get('name');

  // Update display sync time periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (lastSyncTimeRef.current > 0) {
        setDisplaySyncTime(lastSyncTimeRef.current);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Update ref when currentLeader changes
  useEffect(() => {
    currentLeaderRef.current = currentLeader;
  }, [currentLeader]);

  // Force data refresh function for mobile fallback
  const forceDataRefresh = useCallback(async () => {
    console.log('🔄 Force refreshing data...');
    try {
      const [leadersData, activePartData] = await Promise.all([
        getLeaders(),
        getActivePart()
      ]);
      
      // Find current leader by name from URL
      if (leaderName) {
        const existingLeader = leadersData.find(
          (leader: Leader) => leader.name === leaderName
        );
        if (existingLeader) {
          setCurrentLeader(existingLeader);
        } else if (currentLeaderRef.current) {
          // Leader đã bị xóa → reset
          setCurrentLeader(null);
          const url = new URL(window.location.href);
          url.searchParams.delete('name');
          window.history.replaceState({}, '', url.toString());
        }
      }
      
      setActivePart(activePartData);
      setError('');
      lastSyncTimeRef.current = Date.now();
      console.log('✅ Force data refresh completed');
    } catch (err) {
      console.error('❌ Force data refresh failed:', err);
      setError(err instanceof Error ? err.message : 'Có lỗi khi tải dữ liệu');
    }
  }, [leaderName]);

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
        lastSyncTimeRef.current = Date.now();
      } catch (err) {
        clearTimeout(loadingTimeout);
        setError(err instanceof Error ? err.message : 'Có lỗi khi tải dữ liệu');
        setLoading(false);
      }
    };

    loadData();

    // Setup WebSocket connection
    const wsClient = new WebSocketClient(
      (leaders) => {
        console.log('📥 Received leaders update:', leaders);
        lastSyncTimeRef.current = Date.now();
        // Find current leader by name from URL
        if (Array.isArray(leaders) && leaderName) {
          const existingLeader = leaders.find(
            (leader: Leader) => leader.name === leaderName
          );
          if (existingLeader) {
            setCurrentLeader(existingLeader);
          } else if (currentLeaderRef.current) {
            // Leader đã bị xóa → reset
            setCurrentLeader(null);
            const url = new URL(window.location.href);
            url.searchParams.delete('name');
            window.history.replaceState({}, '', url.toString());
          }
        }
      },
      (parts) => {
        console.log('📥 Received parts update:', parts);
        lastSyncTimeRef.current = Date.now();
        const activePartFound = parts.find((p: Part) => p.active);
        setActivePart(activePartFound || null);
      },
      (activePart) => {
        console.log('📥 Received active part update:', activePart);
        lastSyncTimeRef.current = Date.now();
        setActivePart(activePart);
      },
      forceDataRefresh // Add force refresh callback for mobile
    );

    wsClient.connect();

    // Add touch/click listener for mobile interaction detection
    const handleUserInteraction = () => {
      const timeSinceLastSync = Date.now() - lastSyncTimeRef.current;
      // If more than 10 seconds since last sync and we have user interaction, force refresh
      if (timeSinceLastSync > 10000) {
        console.log('🔄 User interaction detected, checking for updates...');
        forceDataRefresh().catch(console.error);
      }
    };

    // Add event listeners for user interaction
    const events = ['touchstart', 'click', 'focus'];
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { passive: true });
    });

    return () => {
      clearTimeout(loadingTimeout);
      wsClient.disconnect();
      // Remove event listeners
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, [leaderName, forceDataRefresh]);

  const handleLeaderRegistered = (leader: Leader) => {
    setCurrentLeader(leader);
    const url = new URL(window.location.href);
    url.searchParams.set('name', leader.name);
    window.history.replaceState({}, '', url.toString());
  };

  const handleLeaderCompleted = (leader: Leader) => {
    setCurrentLeader(leader);
    lastSyncTimeRef.current = Date.now();
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

  const handleManualRefresh = async () => {
    console.log('🔄 Manual refresh triggered');
    setLoading(true);
    try {
      const [leadersData, activePartData] = await Promise.all([
        getLeaders(),
        getActivePart()
      ]);
      
      // Find current leader by name from URL
      if (leaderName) {
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
      }
      
      setActivePart(activePartData);
      setError('');
      lastSyncTimeRef.current = Date.now();
      console.log('✅ Manual refresh completed');
    } catch (err) {
      console.error('❌ Manual refresh failed:', err);
      setError(err instanceof Error ? err.message : 'Có lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
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
          {/* Sync status indicator */}
          {displaySyncTime > 0 && (
            <div className="text-xs text-gray-500 mt-2 flex items-center justify-center gap-2">
              <span>
                Cập nhật lần cuối: {new Date(displaySyncTime).toLocaleTimeString('vi-VN')}
                {Date.now() - displaySyncTime > 30000 && (
                  <span className="text-orange-600 ml-2">⚠️ Có thể chưa được đồng bộ</span>
                )}
              </span>
              <button
                onClick={handleManualRefresh}
                disabled={loading}
                className="text-blue-600 hover:text-blue-800 underline text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                title="Làm mới dữ liệu"
              >
                🔄 Làm mới
              </button>
            </div>
          )}
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
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
      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header Section - Optimized for mobile */}
          <div className="text-center mb-6 md:mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-3 md:mb-4">
              <span className="text-xl md:text-2xl">👑</span>
            </div>
            <h1 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              StepTogether - Trang Leader
            </h1>
            <p className="text-gray-600 text-sm md:text-base px-4">
              Đăng ký và theo dõi tiến trình hoàn thành nhiệm vụ
            </p>
            
            {/* Sync status indicator - Mobile optimized */}
            {displaySyncTime > 0 && (
              <div className="mt-3 bg-white rounded-lg shadow-sm border border-gray-100 p-3 mx-4">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <span className="text-green-500">🟢</span>
                    <span>
                      Cập nhật: {new Date(displaySyncTime).toLocaleTimeString('vi-VN')}
                    </span>
                  </div>
                  {Date.now() - displaySyncTime > 30000 && (
                    <span className="text-orange-600 flex items-center gap-1">
                      ⚠️ Có thể chưa đồng bộ
                    </span>
                  )}
                  <button
                    onClick={handleManualRefresh}
                    disabled={loading}
                    className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1 rounded-full text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Làm mới dữ liệu"
                  >
                    🔄 Làm mới
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Error display - Mobile optimized */}
          {error && (
            <div className="mb-6 mx-4">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <div className="text-red-500 text-2xl mb-2">⚠️</div>
                <p className="text-red-600 font-medium text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* TodoList - Mobile optimized */}
          {activePart && (
            <div className="mb-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mx-4">
                <div className="bg-gradient-to-r from-green-500 to-blue-600 p-3 md:p-4">
                  <h2 className="text-white font-semibold text-base md:text-lg flex items-center gap-2">
                    <span>📝</span>
                    <span>Nhiệm vụ hiện tại</span>
                  </h2>
                </div>
                <div className="p-4">
                  <TodoList 
                    part={activePart} 
                    editable={true}
                    onTodoToggle={handleTodoToggle}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Main Content - Mobile optimized */}
          <div className="mx-4">
            {!currentLeader ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-3 md:p-4">
                  <h2 className="text-white font-semibold text-base md:text-lg flex items-center gap-2">
                    <span>👤</span>
                    <span>Đăng ký Leader</span>
                  </h2>
                </div>
                <div className="p-4 md:p-6">
                  <LeaderForm onLeaderRegistered={handleLeaderRegistered} />
                </div>
              </div>
            ) : (
              <div className="space-y-4 md:space-y-6">
                {/* Leader Info Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mb-3">
                      <span className="text-2xl">👑</span>
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-800">
                      Xin chào, {currentLeader.name}!
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Trạng thái: {currentLeader.completed ? 
                        <span className="text-green-600 font-semibold">✅ Đã hoàn thành</span> : 
                        <span className="text-yellow-600 font-semibold">⏳ Đang thực hiện</span>
                      }
                    </p>
                  </div>
                  
                  {/* Action Buttons - Mobile optimized */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <LeaderButton 
                      leader={currentLeader} 
                      onLeaderCompleted={handleLeaderCompleted} 
                    />
                    <HelpButton 
                      leader={currentLeader}
                      onHelpToggled={handleHelpToggled}
                    />
                  </div>
                </div>
                
                {/* Register Another Leader */}
                <div className="text-center">
                  <a
                    href="/leader"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                  >
                    <span>👥</span>
                    <span>Đăng ký leader khác</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Navigation - Mobile optimized */}
          <div className="mt-6 md:mt-8 text-center">
            <a
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 px-6 py-3 rounded-xl transition-all duration-200 shadow-sm font-medium"
            >
              <span>📊</span>
              <span>Xem trang tổng hợp</span>
            </a>
          </div>

          {/* Bottom Spacing for mobile */}
          <div className="h-8 md:h-0"></div>
        </div>
      </div>
    </div>
  );

}

export default function LeaderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-b-transparent"></div>
          </div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Đang khởi tạo...</h2>
          <p className="text-sm text-gray-600">Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    }>
      <LeaderPageContent />
    </Suspense>
  );
}
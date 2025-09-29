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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
            <div className="animate-spin rounded-full h-7 w-7 sm:h-8 sm:w-8 border-2 border-white border-b-transparent"></div>
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-2">Đang tải dữ liệu...</h2>
          <p className="text-sm text-gray-400">Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header Section - Mobile optimized dark mode */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-3 sm:mb-4">
              <span className="text-lg sm:text-xl md:text-2xl">👑</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 px-2">
              StepTogether - Trang Leader
            </h1>
            <p className="text-gray-300 text-sm sm:text-base px-4">
              Đăng ký và theo dõi tiến trình hoàn thành nhiệm vụ
            </p>
            
            {/* Sync status indicator - Dark mode mobile optimized */}
            {displaySyncTime > 0 && (
              <div className="mt-3 bg-gray-800 rounded-lg border border-gray-700 p-3 mx-3 sm:mx-4">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <span className="text-green-400">🟢</span>
                    <span>
                      Cập nhật: {new Date(displaySyncTime).toLocaleTimeString('vi-VN')}
                    </span>
                  </div>
                  {Date.now() - displaySyncTime > 30000 && (
                    <span className="text-orange-400 flex items-center gap-1">
                      ⚠️ Có thể chưa đồng bộ
                    </span>
                  )}
                  <button
                    onClick={handleManualRefresh}
                    disabled={loading}
                    className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-full text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[36px] min-w-[80px]"
                    title="Làm mới dữ liệu"
                  >
                    🔄 Làm mới
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Error display - Dark mode mobile optimized */}
          {error && (
            <div className="mb-6 mx-3 sm:mx-4">
              <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 text-center">
                <div className="text-red-400 text-2xl mb-2">⚠️</div>
                <p className="text-red-300 font-medium text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* TodoList - Dark mode mobile optimized */}
          {activePart && (
            <div className="mb-6">
              <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden mx-3 sm:mx-4">
                <div className="bg-gradient-to-r from-green-600 to-blue-600 p-3 sm:p-4">
                  <h2 className="text-white font-semibold text-base sm:text-lg flex items-center gap-2">
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

          {/* Main Content - Dark mode mobile optimized */}
          <div className="mx-3 sm:mx-4">
            {!currentLeader ? (
              <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-3 sm:p-4">
                  <h2 className="text-white font-semibold text-base sm:text-lg flex items-center gap-2">
                    <span>👤</span>
                    <span>Đăng ký Leader</span>
                  </h2>
                </div>
                <div className="p-4 sm:p-6">
                  <LeaderForm onLeaderRegistered={handleLeaderRegistered} />
                </div>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {/* Leader Info Card */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 sm:p-6">
                  <div className="text-center mb-4 sm:mb-6">
                    <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mb-3">
                      <span className="text-2xl">👑</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white px-2">
                      Xin chào, {currentLeader.name}!
                    </h3>
                    <p className="text-sm text-gray-300 mt-1 px-2">
                      Trạng thái: {currentLeader.completed ? 
                        <span className="text-green-400 font-semibold">✅ Đã hoàn thành</span> : 
                        <span className="text-yellow-400 font-semibold">⏳ Đang thực hiện</span>
                      }
                    </p>
                  </div>
                  
                  {/* Action Buttons - Mobile optimized with larger touch targets */}
                  <div className="flex flex-col gap-3 sm:gap-4">
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
                    className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 bg-blue-900/30 hover:bg-blue-900/50 px-6 py-3 rounded-lg transition-colors text-sm font-medium min-h-[44px] border border-blue-800"
                  >
                    <span>👥</span>
                    <span>Đăng ký leader khác</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Navigation - Dark mode mobile optimized */}
          <div className="mt-6 sm:mt-8 text-center px-3">
            <a
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white px-8 py-4 rounded-xl transition-all duration-200 shadow-lg font-medium text-base min-h-[48px]"
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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
            <div className="animate-spin rounded-full h-7 w-7 sm:h-8 sm:w-8 border-2 border-white border-b-transparent"></div>
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-2">Đang khởi tạo...</h2>
          <p className="text-sm text-gray-400">Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    }>
      <LeaderPageContent />
    </Suspense>
  );
}
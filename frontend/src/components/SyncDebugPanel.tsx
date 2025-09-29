import { useState } from 'react';

interface SyncDebugPanelProps {
  status: {
    websocket: { connected: boolean };
    polling: { isPolling: boolean; currentInterval: number; consecutiveErrors: number };
    network: { isOnline: boolean; connectionType: string; isVisible: boolean; hasFocus: boolean };
    lastDataTimestamp: number;
    timeSinceLastData: number;
  };
  onForceSync?: () => void;
}

export default function SyncDebugPanel({ status, onForceSync }: SyncDebugPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Only show in development or when there are issues
  const isDev = process.env.NODE_ENV === 'development';
  const hasIssues = status.polling.consecutiveErrors > 0 || !status.websocket.connected || !status.network.isOnline;
  
  if (!isDev && !hasIssues) return null;

  const formatTime = (timestamp: number) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleTimeString();
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s ago`;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-gray-800 text-white rounded-lg shadow-lg max-w-sm">
        <div 
          className="px-4 py-2 cursor-pointer flex items-center justify-between"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="font-medium">Sync Status</span>
          <span className="text-xs">{isExpanded ? '▼' : '▶'}</span>
        </div>
        
        {isExpanded && (
          <div className="px-4 pb-4 space-y-3 text-xs">
            {/* WebSocket Status */}
            <div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${status.websocket.connected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className="font-medium">WebSocket</span>
              </div>
              <div className="ml-4 text-gray-300">
                {status.websocket.connected ? 'Connected' : 'Disconnected'}
              </div>
            </div>

            {/* Polling Status */}
            <div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${status.polling.isPolling ? 'bg-blue-400' : 'bg-gray-400'}`}></div>
                <span className="font-medium">Polling</span>
              </div>
              <div className="ml-4 text-gray-300">
                <div>Interval: {status.polling.currentInterval}ms</div>
                <div>Errors: {status.polling.consecutiveErrors}</div>
              </div>
            </div>

            {/* Network Status */}
            <div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${status.network.isOnline ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className="font-medium">Network</span>
              </div>
              <div className="ml-4 text-gray-300">
                <div>Online: {status.network.isOnline ? 'Yes' : 'No'}</div>
                <div>Type: {status.network.connectionType}</div>
                <div>Visible: {status.network.isVisible ? 'Yes' : 'No'}</div>
                <div>Focus: {status.network.hasFocus ? 'Yes' : 'No'}</div>
              </div>
            </div>

            {/* Last Data */}
            <div>
              <div className="font-medium">Last Data</div>
              <div className="ml-4 text-gray-300">
                <div>Time: {formatTime(status.lastDataTimestamp)}</div>
                <div>Age: {formatDuration(status.timeSinceLastData)}</div>
              </div>
            </div>

            {/* Actions */}
            {onForceSync && (
              <button
                onClick={onForceSync}
                className="w-full bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm font-medium"
              >
                Force Sync
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
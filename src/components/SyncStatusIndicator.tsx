interface SyncStatusIndicatorProps {
  status: {
    websocket: { connected: boolean };
    polling: { isPolling: boolean; currentInterval: number; consecutiveErrors: number };
    network: { isOnline: boolean; connectionType: string; isVisible: boolean; hasFocus: boolean };
    lastDataTimestamp: number;
    timeSinceLastData: number;
  };
}

export default function SyncStatusIndicator({ status }: SyncStatusIndicatorProps) {
  const { websocket, polling, network, timeSinceLastData } = status;
  const isHealthy = timeSinceLastData < 60000; // Healthy if data received within 1 minute

  const getStatusColor = () => {
    if (!network.isOnline) return 'bg-red-500';
    if (!isHealthy) return 'bg-yellow-500';
    if (websocket.connected) return 'bg-green-500';
    return 'bg-yellow-500';
  };

  const getStatusText = () => {
    if (!network.isOnline) return 'Offline';
    if (!isHealthy) return 'Syncing...';
    if (websocket.connected) return 'Connected';
    return 'Polling';
  };

  // Only show if there's an issue or for debugging
  const shouldShow = !isHealthy || !websocket.connected || !network.isOnline;

  if (!shouldShow) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-md border px-3 py-2 flex items-center space-x-2 text-sm">
        <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
        <span className="text-gray-700">{getStatusText()}</span>
        {polling.consecutiveErrors > 0 && (
          <span className="text-red-600 text-xs">
            ({polling.consecutiveErrors} errors)
          </span>
        )}
      </div>
    </div>
  );
}
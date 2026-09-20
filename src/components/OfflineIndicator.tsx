import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/usePWAInstall';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      id="pwa-offline-indicator"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-950/90 border border-amber-500/50 px-3.5 py-2 text-xs font-medium text-amber-200 shadow-xl backdrop-blur-md animate-in slide-in-from-bottom-3 duration-300"
    >
      <WifiOff className="w-4 h-4 text-amber-400 animate-pulse" />
      <span>Đang chạy ở chế độ ngoại tuyến (Offline) — Dữ liệu đệm đang được sử dụng.</span>
    </div>
  );
};

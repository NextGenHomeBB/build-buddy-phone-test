import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, RefreshCw, Database } from 'lucide-react';
import { getSyncStatus, startSync } from '@/services/sync.service';
import { toast } from 'sonner';

interface SyncStatus {
  online: boolean;
  initialized: boolean;
  pendingSync: number;
}

export function SyncStatusIndicator() {
  const [status, setStatus] = useState<SyncStatus>({ online: false, initialized: false, pendingSync: 0 });
  const [syncing, setSyncing] = useState(false);

  const checkStatus = async () => {
    try {
      const currentStatus = await getSyncStatus();
      setStatus(currentStatus);
    } catch (error) {
      console.error('Failed to get sync status:', error);
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 5000); // Check every 5 seconds
    
    // Listen for sync updates
    const handleSyncUpdate = () => checkStatus();
    window.addEventListener('sync-update', handleSyncUpdate);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('sync-update', handleSyncUpdate);
    };
  }, []);

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      await startSync();
      toast.success('Sync completed successfully');
    } catch (error) {
      toast.error('Sync failed: ' + (error as Error).message);
    } finally {
      setSyncing(false);
    }
  };

  const getStatusColor = () => {
    if (!status.initialized) return 'secondary';
    if (!status.online) return 'destructive';
    if (status.pendingSync > 0) return 'outline';
    return 'default';
  };

  const getStatusText = () => {
    if (!status.initialized) return 'Initializing...';
    if (!status.online) return 'Offline';
    if (status.pendingSync > 0) return `${status.pendingSync} pending`;
    return 'Synced';
  };

  return (
    <div className="flex items-center gap-2">
      <Badge variant={getStatusColor()} className="flex items-center gap-1">
        {status.online ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
        {getStatusText()}
      </Badge>
      
      {status.initialized && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleManualSync}
          disabled={syncing}
          className="h-auto p-1"
        >
          <RefreshCw className={`h-3 w-3 ${syncing ? 'animate-spin' : ''}`} />
        </Button>
      )}
      
      {status.initialized && (
        <Badge variant="outline" className="flex items-center gap-1 text-xs">
          <Database className="h-3 w-3" />
          Local DB
        </Badge>
      )}
    </div>
  );
}
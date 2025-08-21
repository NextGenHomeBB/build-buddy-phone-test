import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wifi, WifiOff, Database, RefreshCw, AlertTriangle, CheckCircle, Settings } from 'lucide-react';
import { getSyncStatus, startSync } from '@/services/sync.service';
import { CacheClearDialog } from '@/components/CacheClearDialog';
import { toast } from 'sonner';

interface SyncStatus {
  online: boolean;
  initialized: boolean;
  pendingSync: number;
}

interface SyncHealth {
  status: SyncStatus | null;
  lastSyncTime: number;
  isStale: boolean;
  hasErrors: boolean;
}

export function EnhancedSyncStatus() {
  const [syncHealth, setSyncHealth] = useState<SyncHealth>({
    status: null,
    lastSyncTime: 0,
    isStale: false,
    hasErrors: false
  });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const checkSyncHealth = async () => {
    try {
      const status = await getSyncStatus();
      const now = Date.now();
      const lastSync = localStorage.getItem('lastSyncTime');
      const lastSyncTime = lastSync ? parseInt(lastSync) : now;
      
      // Consider sync stale if no sync in last 5 minutes
      const isStale = (now - lastSyncTime) > 5 * 60 * 1000;
      
      setSyncHealth({
        status,
        lastSyncTime,
        isStale,
        hasErrors: !status.initialized || status.pendingSync > 5 // More than 5 pending items is concerning
      });
    } catch (error) {
      console.error('Failed to get sync status:', error);
      setSyncHealth({
        status: null,
        lastSyncTime: 0,
        isStale: true,
        hasErrors: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      await startSync();
      localStorage.setItem('lastSyncTime', Date.now().toString());
      toast.success('Sync completed successfully');
      await checkSyncHealth();
    } catch (error) {
      toast.error('Sync failed: ' + (error as Error).message);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    checkSyncHealth();
    
    // Check status every 30 seconds
    const interval = setInterval(checkSyncHealth, 30000);
    
    // Listen for sync events
    const handleSyncUpdate = () => {
      localStorage.setItem('lastSyncTime', Date.now().toString());
      checkSyncHealth();
    };
    
    const handleSyncComplete = () => {
      localStorage.setItem('lastSyncTime', Date.now().toString());
      checkSyncHealth();
    };
    
    window.addEventListener('sync-update', handleSyncUpdate);
    window.addEventListener('sync-complete', handleSyncComplete);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('sync-update', handleSyncUpdate);
      window.removeEventListener('sync-complete', handleSyncComplete);
    };
  }, []);

  if (loading) {
    return (
      <Card className="border-muted">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm">Checking sync status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { status, isStale, hasErrors } = syncHealth;

  if (!status) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Sync service unavailable - app may show outdated data</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={checkSyncHealth}>
              Retry
            </Button>
            <CacheClearDialog>
              <Button variant="outline" size="sm">
                <Settings className="h-3 w-3 mr-1" />
                Reset App
              </Button>
            </CacheClearDialog>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Show different alerts based on sync health
  if (isStale || hasErrors || !status.online) {
    return (
      <Alert variant={!status.online ? "destructive" : "default"}>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            {!status.online && "App is offline - data may be outdated"}
            {status.online && isStale && "Sync appears stale - data may be outdated"}
            {status.online && !isStale && hasErrors && `${status.pendingSync} items waiting to sync`}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleManualSync}
              disabled={syncing}
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync Now'}
            </Button>
            {(isStale || hasErrors) && (
              <CacheClearDialog>
                <Button variant="outline" size="sm">
                  <Settings className="h-3 w-3 mr-1" />
                  Reset App
                </Button>
              </CacheClearDialog>
            )}
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Compact success indicator when everything is working
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Badge variant="outline" className="flex items-center gap-1">
        <CheckCircle className="h-3 w-3 text-green-600" />
        <Wifi className="h-3 w-3" />
        <Database className="h-3 w-3" />
        Synced
      </Badge>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, Database, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { getSyncStatus } from '@/services/sync.service';

interface SyncStatus {
  online: boolean;
  initialized: boolean;
  pendingSync: number;
}

export function SyncStatusDisplay() {
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const checkSyncStatus = async () => {
    setLoading(true);
    try {
      const syncStatus = await getSyncStatus();
      setStatus(syncStatus);
    } catch (error) {
      console.error('Failed to get sync status:', error);
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSyncStatus();
    
    // Check status every 10 seconds
    const interval = setInterval(checkSyncStatus, 10000);
    
    return () => clearInterval(interval);
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

  if (!status) {
    return (
      <Card className="border-destructive/20 bg-destructive/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-sm">Sync service unavailable</span>
            <Button variant="outline" size="sm" onClick={checkSyncStatus}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border ${!status.online ? 'border-warning/20 bg-warning/5' : 'border-success/20 bg-success/5'}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Database className="h-4 w-4" />
          Sync Status
          <Button variant="ghost" size="sm" onClick={checkSyncStatus}>
            <RefreshCw className="h-3 w-3" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Connection:</span>
            <Badge variant={status.online ? "default" : "secondary"} className={`text-xs ${status.online ? 'bg-green-100 text-green-800' : ''}`}>
              {status.online ? (
                <>
                  <Wifi className="h-3 w-3 mr-1" />
                  Online
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 mr-1" />
                  Offline
                </>
              )}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Initialized:</span>
            <Badge variant={status.initialized ? "default" : "secondary"} className={`text-xs ${status.initialized ? 'bg-green-100 text-green-800' : ''}`}>
              {status.initialized ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Yes
                </>
              ) : (
                <>
                  <AlertCircle className="h-3 w-3 mr-1" />
                  No
                </>
              )}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Pending sync:</span>
            <Badge variant={status.pendingSync > 0 ? "destructive" : "default"} className={`text-xs ${status.pendingSync === 0 ? 'bg-green-100 text-green-800' : ''}`}>
              {status.pendingSync} items
            </Badge>
          </div>

          {!status.online && (
            <div className="text-xs text-muted-foreground mt-2 p-2 bg-warning/10 rounded">
              App is offline. Some features may be disabled until connection is restored.
            </div>
          )}

          {status.pendingSync > 0 && (
            <div className="text-xs text-muted-foreground mt-2 p-2 bg-info/10 rounded">
              {status.pendingSync} changes waiting to sync when online.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
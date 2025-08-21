import { useEffect, useState, useCallback } from 'react';
import { getSyncStatus, addToSyncOutbox, getOfflineData, storeOfflineData, startSync } from '@/services/sync.service';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface SyncStatus {
  online: boolean;
  initialized: boolean;
  pendingSync: number;
}

interface EnhancedSyncOptions {
  autoSync?: boolean;
  userSpecific?: boolean;
  criticalTables?: string[];
}

export function useEnhancedSync(options: EnhancedSyncOptions = {}) {
  const { autoSync = true, userSpecific = true, criticalTables = [] } = options;
  const [status, setStatus] = useState<SyncStatus>({ online: false, initialized: false, pendingSync: 0 });
  const [isFirstSync, setIsFirstSync] = useState(true);
  const { user, profile } = useAuth();

  const checkStatus = useCallback(async () => {
    try {
      const currentStatus = await getSyncStatus();
      setStatus(currentStatus);
      
      // Initialize sync on first load
      if (isFirstSync && !currentStatus.initialized && autoSync) {
        await startSync();
        setIsFirstSync(false);
      }
    } catch (error) {
      console.error('Failed to get sync status:', error);
    }
  }, [autoSync, isFirstSync]);

  const syncData = useCallback(async (table: string, operation: 'insert' | 'update' | 'delete', data: any) => {
    try {
      if (status.online) {
        // Online: sync immediately
        await addToSyncOutbox(table, operation, data);
      } else {
        // Offline: store locally
        await storeOfflineData(table, data, operation);
      }
    } catch (error) {
      console.error(`Failed to sync data for ${table}:`, error);
      toast.error('Failed to save changes');
    }
  }, [status.online]);

  const getLocalData = useCallback(async (table: string, filter?: any) => {
    try {
      // Add user-specific filtering if enabled
      const enhancedFilter = userSpecific && user ? { 
        ...filter, 
        ...(table === 'tasks' && { assigned_to: user.id }),
        ...(table === 'timesheets' && { user_id: user.id }),
        ...(table === 'user_project_role' && { user_id: user.id })
      } : filter;
      
      return await getOfflineData(table, enhancedFilter);
    } catch (error) {
      console.error(`Failed to get local data for ${table}:`, error);
      return [];
    }
  }, [user, userSpecific]);

  const forceSync = useCallback(async () => {
    try {
      await startSync();
      toast.success('Sync completed');
    } catch (error) {
      console.error('Force sync failed:', error);
      toast.error('Sync failed');
    }
  }, []);

  useEffect(() => {
    checkStatus();
    
    const interval = setInterval(checkStatus, 10000); // Check every 10 seconds
    
    // Listen for sync updates
    const handleSyncUpdate = (event: CustomEvent) => {
      const { table } = event.detail;
      
      // Show notifications for critical table updates
      if (criticalTables.includes(table)) {
        toast.success(`${table} updated successfully`);
      }
      
      checkStatus();
    };
    
    const handleSyncComplete = (event: CustomEvent) => {
      const { syncedItems } = event.detail;
      
      if (syncedItems > 0) {
        toast.success(`Synced ${syncedItems} changes`);
      }
      
      checkStatus();
    };
    
    window.addEventListener('sync-update', handleSyncUpdate as EventListener);
    window.addEventListener('sync-complete', handleSyncComplete as EventListener);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('sync-update', handleSyncUpdate as EventListener);
      window.removeEventListener('sync-complete', handleSyncComplete as EventListener);
    };
  }, [checkStatus, criticalTables]);

  // Worker-specific sync health check
  const getWorkerSyncHealth = useCallback(() => {
    const isWorker = profile?.role === 'worker';
    const hasCriticalData = status.initialized && status.online;
    const hasRecentSync = localStorage.getItem('lastSyncTime');
    
    return {
      canWork: isWorker && hasCriticalData,
      needsSync: !hasRecentSync || status.pendingSync > 0,
      isHealthy: status.online && status.initialized && status.pendingSync === 0
    };
  }, [status, profile]);

  return {
    status,
    syncData,
    getLocalData,
    forceSync,
    getWorkerSyncHealth,
    isWorker: profile?.role === 'worker',
    isManager: profile?.role === 'manager' || profile?.role === 'admin'
  };
}
import { useEffect, useState } from 'react';
import { getSyncStatus, addToSyncOutbox, getOfflineData, storeOfflineData } from '@/services/sync.service';

interface SyncStatus {
  online: boolean;
  initialized: boolean;
  pendingSync: number;
}

export function useSync() {
  const [status, setStatus] = useState<SyncStatus>({ online: false, initialized: false, pendingSync: 0 });

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
    
    // Listen for sync updates
    const handleSyncUpdate = () => checkStatus();
    window.addEventListener('sync-update', handleSyncUpdate);
    
    return () => {
      window.removeEventListener('sync-update', handleSyncUpdate);
    };
  }, []);

  const syncData = async (table: string, operation: 'insert' | 'update' | 'delete', data: any) => {
    if (status.online) {
      // Online: sync immediately
      await addToSyncOutbox(table, operation, data);
    } else {
      // Offline: store locally
      await storeOfflineData(table, data, operation);
    }
  };

  const getLocalData = async (table: string, filter?: any) => {
    return await getOfflineData(table, filter);
  };

  return {
    status,
    syncData,
    getLocalData,
  };
}
import { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { RotateCcw, Database, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CacheClearDialogProps {
  children: React.ReactNode;
}

export function CacheClearDialog({ children }: CacheClearDialogProps) {
  const [isClearing, setIsClearing] = useState(false);
  const { toast } = useToast();

  const clearAllCaches = async () => {
    setIsClearing(true);
    
    try {
      // 1. Clear Service Worker caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }

      // 2. Clear localStorage
      localStorage.clear();

      // 3. Clear sessionStorage
      sessionStorage.clear();

      // 4. Clear IndexedDB
      if ('indexedDB' in window) {
        const databases = ['idb-client', 'sync-service', 'offline-store'];
        for (const dbName of databases) {
          try {
            const deleteRequest = indexedDB.deleteDatabase(dbName);
            await new Promise((resolve, reject) => {
              deleteRequest.onsuccess = () => resolve(true);
              deleteRequest.onerror = () => reject(deleteRequest.error);
            });
          } catch (error) {
            console.warn(`Failed to delete database ${dbName}:`, error);
          }
        }
      }

      // 5. Unregister Service Worker
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (let registration of registrations) {
          await registration.unregister();
        }
      }

      toast({
        title: "Cache Cleared",
        description: "All caches have been cleared. The app will reload now.",
      });

      // 6. Hard reload the page
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      console.error('Error clearing caches:', error);
      toast({
        title: "Cache Clear Failed",
        description: "Some caches could not be cleared. Try refreshing manually.",
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            Clear All Cache
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>This will clear all cached data including:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Service Worker caches</li>
              <li>Browser storage (localStorage, sessionStorage)</li>
              <li>IndexedDB offline data</li>
              <li>PWA cached files</li>
            </ul>
            <p className="text-warning font-medium">
              The app will reload after clearing. Any unsaved work will be lost.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isClearing}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={clearAllCaches}
            disabled={isClearing}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isClearing ? (
              <>
                <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                Clearing...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Cache
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
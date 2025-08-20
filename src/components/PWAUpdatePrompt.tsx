import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function PWAUpdatePrompt() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Listen for new service worker waiting
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SKIP_WAITING') {
          window.location.reload();
        }
      });

      // Check for updates
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg);
        
        // Check if there's a waiting service worker
        if (reg.waiting) {
          setUpdateAvailable(true);
        }

        // Listen for new waiting service worker
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true);
                toast({
                  title: "App Update Available",
                  description: "A new version of the app is ready to install.",
                });
              }
            });
          }
        });
      });

      // Listen for controlling service worker change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  }, [toast]);

  const handleUpdate = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  const handleDismiss = () => {
    setUpdateAvailable(false);
  };

  if (!updateAvailable) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="border-primary shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Download className="h-4 w-4" />
            Update Available
          </CardTitle>
          <CardDescription className="text-sm">
            A new version of Phase-Gate Keeper is ready to install.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex gap-2 pt-0">
          <Button 
            onClick={handleUpdate} 
            size="sm"
            className="flex-1"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Update Now
          </Button>
          <Button 
            onClick={handleDismiss} 
            variant="outline" 
            size="sm"
          >
            Later
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
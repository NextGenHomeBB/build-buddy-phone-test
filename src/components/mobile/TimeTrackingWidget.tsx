import { useState, useEffect } from 'react';
import { Clock, MapPin, Camera, Play, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEnhancedTimeTracking } from '@/hooks/useEnhancedTimeTracking';
import { cn } from '@/lib/utils';

interface TimeTrackingWidgetProps {
  className?: string;
  compact?: boolean;
}

export function TimeTrackingWidget({ className, compact = false }: TimeTrackingWidgetProps) {
  const { 
    activeShift, 
    isLoading, 
    location, 
    startShift, 
    endShift, 
    getElapsedTime, 
    formatElapsedTime 
  } = useEnhancedTimeTracking();
  
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Update elapsed time every second when shift is active
  useEffect(() => {
    if (!activeShift) return;

    const updateElapsed = () => {
      setElapsedSeconds(getElapsedTime());
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [activeShift, getElapsedTime]);

  const handleToggleShift = async () => {
    try {
      if (activeShift) {
        await endShift(true);
      } else {
        await startShift(undefined, true);
      }
    } catch (error) {
      console.error('Shift toggle error:', error);
    }
  };

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Button
          variant={activeShift ? "destructive" : "default"}
          size="sm"
          onClick={handleToggleShift}
          disabled={isLoading}
          className="h-8 px-3"
        >
          {activeShift ? (
            <>
              <Square className="h-3 w-3 mr-1" />
              {formatElapsedTime(elapsedSeconds)}
            </>
          ) : (
            <>
              <Play className="h-3 w-3 mr-1" />
              Start
            </>
          )}
        </Button>
        
        {location && (
          <Badge variant="secondary" className="h-6 px-2">
            <MapPin className="h-3 w-3" />
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-card rounded-lg border p-4 space-y-3",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <span className="font-medium">Time Tracking</span>
        </div>
        
        {activeShift && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Active
          </Badge>
        )}
      </div>

      {/* Time Display */}
      <div className="text-center py-4">
        <div className="text-3xl font-mono font-bold text-primary">
          {activeShift ? formatElapsedTime(elapsedSeconds) : '00:00'}
        </div>
        {activeShift && (
          <div className="text-sm text-muted-foreground mt-1">
            Started at {new Date(activeShift.start_time).toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Status Indicators */}
      <div className="flex justify-center gap-4">
        <div className="flex items-center gap-1 text-sm">
          <MapPin className={cn(
            "h-4 w-4",
            location ? "text-green-500" : "text-muted-foreground"
          )} />
          <span className="text-muted-foreground">
            {location ? "Located" : "No GPS"}
          </span>
        </div>
        
        <div className="flex items-center gap-1 text-sm">
          <Camera className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Photo Ready</span>
        </div>
      </div>

      {/* Action Button */}
      <Button
        variant={activeShift ? "destructive" : "default"}
        onClick={handleToggleShift}
        disabled={isLoading}
        className="w-full"
        size="lg"
      >
        {isLoading ? (
          "Processing..."
        ) : activeShift ? (
          <>
            <Square className="h-4 w-4 mr-2" />
            End Shift
          </>
        ) : (
          <>
            <Play className="h-4 w-4 mr-2" />
            Start Shift
          </>
        )}
      </Button>

      {/* Location Info */}
      {location && (
        <div className="text-xs text-muted-foreground text-center">
          GPS: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
          {location.accuracy && ` (±${Math.round(location.accuracy)}m)`}
        </div>
      )}
    </div>
  );
}
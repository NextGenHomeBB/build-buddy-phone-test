import { useState } from 'react';
import { ArrowLeft, MapPin, Camera, Clock, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TimeTrackingWidget } from '@/components/mobile/TimeTrackingWidget';
import { useEnhancedTimeTracking } from '@/hooks/useEnhancedTimeTracking';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

interface TimesheetHistory {
  id: string;
  start_time: string;
  end_time?: string;
  duration_generated?: number;
  start_location?: any;
  end_location?: any;
  location_verified: boolean;
  start_photo_url?: string;
  end_photo_url?: string;
  project?: { name: string };
}

export default function EnhancedTimeTracking() {
  const navigate = useNavigate();
  const { activeShift, location } = useEnhancedTimeTracking();
  const [history, setHistory] = useState<TimesheetHistory[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // Fetch timesheet history
  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('timesheets')
        .select(`
          *,
          project:projects(name)
        `)
        .not('end_time', 'is', null)
        .order('start_time', { ascending: false })
        .limit(20);

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const formatDuration = (hours?: number) => {
    if (!hours) return 'N/A';
    const totalMinutes = Math.round(hours * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h}h ${m}m`;
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center gap-4 p-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Time Tracking</h1>
            <p className="text-sm text-muted-foreground">
              Track work hours with GPS and photo verification
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Current Shift Widget */}
        <TimeTrackingWidget />

        {/* Location Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {location ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">GPS Signal</span>
                  <Badge variant="secondary" className="bg-green-50 text-green-700">
                    Active
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  Coordinates: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </div>
                {location.accuracy && (
                  <div className="text-xs text-muted-foreground">
                    Accuracy: ±{Math.round(location.accuracy)} meters
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm">GPS Signal</span>
                <Badge variant="outline" className="text-orange-600">
                  Unavailable
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs for History and Analytics */}
        <Tabs defaultValue="history" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="history">Recent Activity</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="space-y-4">
            {isLoadingHistory ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading history...
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No time entries found
              </div>
            ) : (
              history.map((entry) => {
                const startDateTime = formatDateTime(entry.start_time);
                const endDateTime = entry.end_time ? formatDateTime(entry.end_time) : null;
                
                return (
                  <Card key={entry.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-medium">
                            {entry.project?.name || 'No Project'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {startDateTime.date}
                          </div>
                        </div>
                        <Badge variant={entry.location_verified ? "secondary" : "outline"}>
                          {entry.location_verified ? "Verified" : "Unverified"}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Start:</span>
                          <div className="font-medium">{startDateTime.time}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">End:</span>
                          <div className="font-medium">
                            {endDateTime?.time || 'Ongoing'}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Duration:</span>
                          <div className="font-medium">
                            {formatDuration(entry.duration_generated)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {entry.start_location && (
                            <MapPin className="h-3 w-3 text-green-500" />
                          )}
                          {entry.start_photo_url && (
                            <Camera className="h-3 w-3 text-blue-500" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Weekly Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Analytics coming soon...
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
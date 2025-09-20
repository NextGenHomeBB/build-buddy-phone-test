import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useWorkerAvailability } from '@/hooks/useWorkerAvailability';
import { format } from 'date-fns';
import { TimeOffRequestDialog } from './TimeOffRequestDialog';
import { WeeklyAvailabilitySettings } from './WeeklyAvailabilitySettings';
import { QuickUnavailabilityDialog } from './QuickUnavailabilityDialog';
import { AvailabilityStatusBadge } from './AvailabilityStatusBadge';

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const WorkerAvailabilityDashboard = () => {
  const [showTimeOffDialog, setShowTimeOffDialog] = useState(false);
  const [showAvailabilitySettings, setShowAvailabilitySettings] = useState(false);
  const [showQuickUnavailable, setShowQuickUnavailable] = useState(false);
  
  const {
    availabilityPatterns,
    timeOffRequests,
    availabilityOverrides,
    isLoading,
  } = useWorkerAvailability();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const pendingRequests = timeOffRequests?.filter(req => req.status === 'pending') || [];
  const upcomingTimeOff = timeOffRequests?.filter(req => 
    req.status === 'approved' && new Date(req.start_date) > new Date()
  ) || [];
  const recentOverrides = availabilityOverrides?.slice(0, 5) || [];
  const pendingOverrides = availabilityOverrides?.filter(override => override.status === 'pending') || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-success text-success-foreground';
      case 'denied': return 'bg-destructive text-destructive-foreground';
      case 'pending': return 'bg-warning text-warning-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Requests</p>
                <p className="text-2xl font-bold">{pendingRequests.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Upcoming Time Off</p>
                <p className="text-2xl font-bold">{upcomingTimeOff.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Overrides</p>
                <p className="text-2xl font-bold">{recentOverrides.length}</p>
              </div>
              <Clock className="h-8 w-8 text-secondary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setShowTimeOffDialog(true)}>
              Request Time Off
            </Button>
            <Button variant="outline" onClick={() => setShowAvailabilitySettings(true)}>
              Update Availability
            </Button>
            <Button variant="outline" onClick={() => setShowQuickUnavailable(true)}>
              Mark Unavailable
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Tabs */}
      <Tabs defaultValue="schedule" className="space-y-4">
        <TabsList>
          <TabsTrigger value="schedule">My Schedule</TabsTrigger>
          <TabsTrigger value="requests">Time Off Requests</TabsTrigger>
          <TabsTrigger value="overrides">Overrides</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Availability Pattern</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dayNames.map((day, index) => {
                  const pattern = availabilityPatterns?.find(p => p.day_of_week === index);
                  return (
                    <div key={day} className="flex items-center justify-between p-3 rounded-lg border">
                      <span className="font-medium">{day}</span>
                      {pattern ? (
                        <div className="flex items-center gap-2">
                          <Badge variant={pattern.is_available ? "default" : "destructive"}>
                            {pattern.is_available ? 'Available' : 'Unavailable'}
                          </Badge>
                          {pattern.is_available && (
                            <span className="text-sm text-muted-foreground">
                              {pattern.start_time} - {pattern.end_time}
                            </span>
                          )}
                        </div>
                      ) : (
                        <Badge variant="outline">Not Set</Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Time Off Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {timeOffRequests?.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No time off requests yet
                  </p>
                ) : (
                  timeOffRequests?.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium capitalize">{request.request_type.replace('_', ' ')}</span>
                          <Badge className={getStatusColor(request.status)}>
                            {request.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(request.start_date), 'MMM d, yyyy')} - {format(new Date(request.end_date), 'MMM d, yyyy')}
                        </p>
                        {request.reason && (
                          <p className="text-sm text-muted-foreground mt-1">{request.reason}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{request.days_requested} days</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(request.created_at), 'MMM d')}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overrides" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Availability Overrides</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentOverrides.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No availability overrides
                  </p>
                ) : (
                  recentOverrides.map((override) => (
                    <div key={override.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {format(new Date(override.override_date), 'MMM d, yyyy')}
                          </span>
                          <Badge variant={override.is_available ? "default" : "destructive"}>
                            {override.is_available ? 'Available' : 'Unavailable'}
                          </Badge>
                          <AvailabilityStatusBadge status={override.status as 'pending' | 'approved' | 'denied'} />
                        </div>
                        {override.reason && (
                          <p className="text-sm text-muted-foreground">{override.reason}</p>
                        )}
                        {override.status === 'denied' && override.admin_notes && (
                          <p className="text-sm text-red-600 mt-1">
                            <strong>Admin notes:</strong> {override.admin_notes}
                          </p>
                        )}
                      </div>
                      {override.start_time && override.end_time && (
                        <span className="text-sm text-muted-foreground">
                          {override.start_time} - {override.end_time}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <TimeOffRequestDialog 
        open={showTimeOffDialog} 
        onOpenChange={setShowTimeOffDialog} 
      />
      <WeeklyAvailabilitySettings
        open={showAvailabilitySettings}
        onOpenChange={setShowAvailabilitySettings}
        currentPatterns={availabilityPatterns || []}
      />
      <QuickUnavailabilityDialog
        open={showQuickUnavailable}
        onOpenChange={setShowQuickUnavailable}
      />
    </div>
  );
};
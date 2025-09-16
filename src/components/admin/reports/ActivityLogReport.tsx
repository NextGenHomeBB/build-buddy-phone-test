import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Play, 
  Pause, 
  MapPin, 
  Camera,
  User,
  Settings
} from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';

interface ActivityLogProps {
  timesheetEntries: Array<{
    id: string;
    user_id: string;
    user_name: string;
    project_name?: string;
    start_time: string;
    end_time?: string;
    location_verified: boolean;
    approved: boolean;
    start_photo_url?: string;
    end_photo_url?: string;
    created_at: string;
  }>;
  activeShifts: Array<{
    id: string;
    user_name: string;
    start_time: string;
  }>;
}

interface ActivityEvent {
  id: string;
  type: 'shift_start' | 'shift_end' | 'approval' | 'rejection' | 'location_check' | 'photo_upload';
  user_name: string;
  project_name?: string;
  timestamp: string;
  details: string;
  status?: 'success' | 'warning' | 'error';
}

export const ActivityLogReport: React.FC<ActivityLogProps> = ({
  timesheetEntries,
  activeShifts,
}) => {
  const [dateFilter, setDateFilter] = useState('');
  const [activityTypeFilter, setActivityTypeFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');

  // Convert timesheet entries to activity events
  const generateActivityEvents = (): ActivityEvent[] => {
    const events: ActivityEvent[] = [];
    
    // Add shift start events
    timesheetEntries.forEach((entry) => {
      events.push({
        id: `${entry.id}_start`,
        type: 'shift_start',
        user_name: entry.user_name,
        project_name: entry.project_name,
        timestamp: entry.start_time,
        details: `Started shift at ${entry.project_name || 'Unknown project'}`,
        status: entry.location_verified ? 'success' : 'warning'
      });

      // Add shift end events
      if (entry.end_time) {
        events.push({
          id: `${entry.id}_end`,
          type: 'shift_end',
          user_name: entry.user_name,
          project_name: entry.project_name,
          timestamp: entry.end_time,
          details: `Ended shift at ${entry.project_name || 'Unknown project'}`,
          status: 'success'
        });
      }

      // Add approval/rejection events
      if (entry.approved) {
        events.push({
          id: `${entry.id}_approval`,
          type: 'approval',
          user_name: entry.user_name,
          project_name: entry.project_name,
          timestamp: entry.created_at,
          details: `Timesheet approved for ${entry.project_name || 'Unknown project'}`,
          status: 'success'
        });
      }

      // Add location verification events
      if (!entry.location_verified) {
        events.push({
          id: `${entry.id}_location`,
          type: 'location_check',
          user_name: entry.user_name,
          project_name: entry.project_name,
          timestamp: entry.start_time,
          details: 'Location verification failed',
          status: 'warning'
        });
      }

      // Add photo upload events
      if (entry.start_photo_url) {
        events.push({
          id: `${entry.id}_photo_start`,
          type: 'photo_upload',
          user_name: entry.user_name,
          project_name: entry.project_name,
          timestamp: entry.start_time,
          details: 'Start shift photo uploaded',
          status: 'success'
        });
      }

      if (entry.end_photo_url) {
        events.push({
          id: `${entry.id}_photo_end`,
          type: 'photo_upload',
          user_name: entry.user_name,
          project_name: entry.project_name,
          timestamp: entry.end_time || entry.start_time,
          details: 'End shift photo uploaded',
          status: 'success'
        });
      }
    });

    return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const activityEvents = generateActivityEvents();
  
  const filteredEvents = activityEvents.filter((event) => {
    const matchesDate = !dateFilter || 
      format(new Date(event.timestamp), 'yyyy-MM-dd') === dateFilter;
    
    const matchesType = activityTypeFilter === 'all' || event.type === activityTypeFilter;
    const matchesUser = userFilter === 'all' || event.user_name === userFilter;
    
    return matchesDate && matchesType && matchesUser;
  });

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'shift_start':
        return <Play className="h-4 w-4 text-green-500" />;
      case 'shift_end':
        return <Pause className="h-4 w-4 text-red-500" />;
      case 'approval':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejection':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'location_check':
        return <MapPin className="h-4 w-4 text-yellow-500" />;
      case 'photo_upload':
        return <Camera className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getDateLabel = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM dd, yyyy');
  };

  const uniqueUsers = Array.from(new Set(timesheetEntries.map(entry => entry.user_name)));

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="activity-date">Date</Label>
              <Input
                id="activity-date"
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Activity Type</Label>
              <Select value={activityTypeFilter} onValueChange={setActivityTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Activities</SelectItem>
                  <SelectItem value="shift_start">Shift Starts</SelectItem>
                  <SelectItem value="shift_end">Shift Ends</SelectItem>
                  <SelectItem value="approval">Approvals</SelectItem>
                  <SelectItem value="location_check">Location Checks</SelectItem>
                  <SelectItem value="photo_upload">Photo Uploads</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>User</Label>
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {uniqueUsers.map((userName) => (
                    <SelectItem key={userName} value={userName}>
                      {userName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Play className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Shifts Started</p>
                <p className="text-lg font-bold">
                  {filteredEvents.filter(e => e.type === 'shift_start').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Pause className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-sm font-medium">Shifts Ended</p>
                <p className="text-lg font-bold">
                  {filteredEvents.filter(e => e.type === 'shift_end').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Approvals</p>
                <p className="text-lg font-bold">
                  {filteredEvents.filter(e => e.type === 'approval').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Location Issues</p>
                <p className="text-lg font-bold">
                  {filteredEvents.filter(e => e.type === 'location_check').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <div key={event.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                <div className="flex-shrink-0 mt-0.5">
                  {getEventIcon(event.type)}
                </div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {event.user_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{event.user_name}</span>
                      {event.status && (
                        <Badge 
                          variant={event.status === 'success' ? 'default' : 
                                  event.status === 'warning' ? 'secondary' : 'destructive'}
                        >
                          {event.status}
                        </Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {getDateLabel(event.timestamp)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(event.timestamp), 'HH:mm')}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {event.details}
                  </p>
                  {event.project_name && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Project: {event.project_name}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {filteredEvents.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No activity found for the selected filters
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
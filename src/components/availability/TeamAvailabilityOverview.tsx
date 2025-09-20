import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import { useTeamAvailability } from '@/hooks/useTeamAvailability';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const TeamAvailabilityOverview = () => {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [viewMode, setViewMode] = useState<'day' | 'week'>('week');
  
  const { teamAvailability, isLoading, checkWorkerAvailability } = useTeamAvailability();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
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

  const totalWorkers = teamAvailability?.length || 0;
  const approvedTimeOff = teamAvailability?.reduce((count, member) => 
    count + member.timeOffRequests.filter(req => 
      req.status === 'approved' && 
      new Date(req.start_date) <= new Date(selectedDate) &&
      new Date(req.end_date) >= new Date(selectedDate)
    ).length, 0
  ) || 0;
  
  const activeOverrides = teamAvailability?.reduce((count, member) =>
    count + member.availabilityOverrides.filter(override =>
      isSameDay(new Date(override.override_date), new Date(selectedDate))
    ).length, 0
  ) || 0;

  // Calculate actual available workers considering only approved overrides
  const unavailableOverrides = teamAvailability?.reduce((count, member) =>
    count + member.availabilityOverrides.filter(override =>
      isSameDay(new Date(override.override_date), new Date(selectedDate)) && 
      !override.is_available && 
      override.status === 'approved'
    ).length, 0
  ) || 0;

  const availableWorkers = totalWorkers - approvedTimeOff - unavailableOverrides;

  const getWeekDays = (date: string) => {
    const startDate = startOfWeek(new Date(date));
    return Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
  };

  const weekDays = getWeekDays(selectedDate);

  const getWorkerStatusForDate = (member: any, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Check for approved time off
    const hasTimeOff = member.timeOffRequests.some((req: any) =>
      req.status === 'approved' &&
      new Date(req.start_date) <= date &&
      new Date(req.end_date) >= date
    );
    
    if (hasTimeOff) return { status: 'off', label: 'Time Off' };
    
    // Check for overrides
    const override = member.availabilityOverrides.find((override: any) =>
      isSameDay(new Date(override.override_date), date)
    );
    
    if (override) {
      return { 
        status: override.is_available ? 'available' : 'unavailable', 
        label: override.is_available ? 'Available (Override)' : 'Unavailable (Override)' 
      };
    }
    
    // Check regular availability pattern
    const dayOfWeek = date.getDay();
    const pattern = member.availabilityPatterns.find((p: any) => p.day_of_week === dayOfWeek);
    
    if (pattern) {
      return { 
        status: pattern.is_available ? 'available' : 'unavailable',
        label: pattern.is_available ? `Available ${pattern.start_time}-${pattern.end_time}` : 'Not Available'
      };
    }
    
    return { status: 'available', label: 'Available (Default)' };
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'available': return 'default';
      case 'unavailable': return 'destructive';
      case 'off': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Workers</p>
                <p className="text-2xl font-bold">{totalWorkers}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Available Today</p>
                <p className="text-2xl font-bold">{availableWorkers}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">On Time Off</p>
                <p className="text-2xl font-bold">{approvedTimeOff}</p>
              </div>
              <Calendar className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Overrides</p>
                <p className="text-2xl font-bold">{activeOverrides}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-secondary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Team Availability Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <label htmlFor="date-picker" className="text-sm font-medium">Date:</label>
              <Input
                id="date-picker"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-auto"
              />
            </div>
            
            <Select value={viewMode} onValueChange={(value: 'day' | 'week') => setViewMode(value)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day View</SelectItem>
                <SelectItem value="week">Week View</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Team Calendar */}
          <div className="space-y-4">
            {viewMode === 'week' ? (
              <>
                {/* Week Header */}
                <div className="grid grid-cols-8 gap-2 text-sm font-medium text-muted-foreground">
                  <div>Worker</div>
                  {weekDays.map((day) => (
                    <div key={day.toISOString()} className="text-center">
                      <div>{format(day, 'EEE')}</div>
                      <div>{format(day, 'MMM d')}</div>
                    </div>
                  ))}
                </div>

                {/* Worker Rows */}
                <div className="space-y-2">
                  {teamAvailability?.map((member) => (
                    <div key={member.user.user_id} className="grid grid-cols-8 gap-2 items-center p-2 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.user.avatar_url} />
                          <AvatarFallback>
                            {member.user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">{member.user.name}</span>
                      </div>
                      
                      {weekDays.map((day) => {
                        const status = getWorkerStatusForDate(member, day);
                        return (
                          <div key={day.toISOString()} className="text-center">
                            <Badge
                              variant={getStatusBadgeVariant(status.status)}
                              className="text-xs px-1 py-0"
                            >
                              {status.status === 'available' ? '✓' :
                               status.status === 'off' ? '🏖️' :
                               status.status === 'unavailable' ? '✗' : '?'}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              // Day View
              <div className="space-y-2">
                {teamAvailability?.map((member) => {
                  const status = getWorkerStatusForDate(member, new Date(selectedDate));
                  return (
                    <div key={member.user.user_id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.user.avatar_url} />
                          <AvatarFallback>
                            {member.user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="font-medium">{member.user.name}</span>
                          <p className="text-sm text-muted-foreground">{member.user.role}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <Badge variant={getStatusBadgeVariant(status.status)}>
                          {status.label}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
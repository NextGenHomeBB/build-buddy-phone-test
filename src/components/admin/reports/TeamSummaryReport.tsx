import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface TeamSummaryReportProps {
  activeShifts: Array<{
    id: string;
    user_id: string;
    user_name: string;
    project_name?: string;
    start_time: string;
    location_verified: boolean;
  }>;
  userAnalytics: Array<{
    user_id: string;
    user_name: string;
    total_hours: number;
    total_shifts: number;
    attendance_rate: number;
  }>;
}

export const TeamSummaryReport: React.FC<TeamSummaryReportProps> = ({
  activeShifts,
  userAnalytics,
}) => {
  const totalActiveWorkers = activeShifts.length;
  const totalHoursToday = userAnalytics.reduce((sum, user) => sum + user.total_hours, 0);
  const avgAttendance = userAnalytics.length > 0 
    ? userAnalytics.reduce((sum, user) => sum + user.attendance_rate, 0) / userAnalytics.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Workers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActiveWorkers}</div>
            <p className="text-xs text-muted-foreground">Currently working</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Hours Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHoursToday.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">Across all projects</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgAttendance.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Team attendance rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Shifts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Active Shifts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeShifts.map((shift) => (
              <div key={shift.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback>{shift.user_name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{shift.user_name}</p>
                    <p className="text-sm text-muted-foreground">{shift.project_name || 'No project'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      Started: {format(new Date(shift.start_time), 'HH:mm')}
                    </p>
                    <div className="flex items-center gap-1">
                      {shift.location_verified ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-yellow-500" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {shift.location_verified ? 'Verified' : 'Unverified'}
                      </span>
                    </div>
                  </div>
                  <Badge variant="secondary">Active</Badge>
                </div>
              </div>
            ))}
            {activeShifts.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No active shifts</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Team Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Team Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userAnalytics.map((user) => (
              <div key={user.user_id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback>{user.user_name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.user_name}</p>
                    <p className="text-sm text-muted-foreground">{user.total_shifts} shifts completed</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-right">
                  <div>
                    <p className="text-sm font-medium">{user.total_hours.toFixed(1)}h</p>
                    <p className="text-xs text-muted-foreground">Total hours</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{user.attendance_rate.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground">Attendance</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
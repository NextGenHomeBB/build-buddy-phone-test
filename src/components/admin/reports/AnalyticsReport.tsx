import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserAnalyticsChart } from '@/components/admin/UserAnalyticsChart';

interface AnalyticsReportProps {
  userAnalytics: Array<{
    user_id: string;
    user_name: string;
    total_hours: number;
    total_shifts: number;
    avg_daily_hours: number;
    attendance_rate: number;
    overtime_hours: number;
    project_breakdown: Array<{
      project_name: string;
      hours: number;
      percentage: number;
    }>;
    daily_hours: Array<{
      date: string;
      hours: number;
    }>;
    weekly_trend: Array<{
      week: string;
      hours: number;
    }>;
    monthly_trend: Array<{
      month: string;
      hours: number;
    }>;
  }>;
  selectedUser: string | null;
  onUserChange: (userId: string | null) => void;
  viewPeriod: 'daily' | 'weekly' | 'monthly';
}

export const AnalyticsReport: React.FC<AnalyticsReportProps> = ({
  userAnalytics,
  selectedUser,
  onUserChange,
  viewPeriod,
}) => {
  const totalUsers = userAnalytics.length;
  const totalHours = userAnalytics.reduce((sum, user) => sum + user.total_hours, 0);
  const avgHoursPerUser = totalUsers > 0 ? totalHours / totalUsers : 0;
  const avgAttendanceRate = totalUsers > 0 
    ? userAnalytics.reduce((sum, user) => sum + user.attendance_rate, 0) / totalUsers 
    : 0;

  const topPerformers = userAnalytics
    .sort((a, b) => b.total_hours - a.total_hours)
    .slice(0, 5);

  const overtimeUsers = userAnalytics
    .filter(user => user.overtime_hours > 0)
    .sort((a, b) => b.overtime_hours - a.overtime_hours);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Workers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">Active team members</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">Across all projects</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Hours/User</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgHoursPerUser.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">Per team member</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgAttendanceRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Team average</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Card>
        <CardHeader>
          <CardTitle>User Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <UserAnalyticsChart
            analytics={userAnalytics}
            selectedUser={selectedUser}
            onUserChange={onUserChange}
            viewPeriod={viewPeriod}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performers (By Hours)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPerformers.map((user, index) => (
                <div key={user.user_id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{user.user_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {user.total_shifts} shifts • {user.attendance_rate.toFixed(1)}% attendance
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{user.total_hours.toFixed(1)}h</p>
                    <p className="text-sm text-muted-foreground">
                      {user.avg_daily_hours.toFixed(1)}h/day
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Overtime Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Overtime Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {overtimeUsers.length > 0 ? (
                overtimeUsers.map((user) => (
                  <div key={user.user_id} className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div>
                      <p className="font-medium">{user.user_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Regular: {(user.total_hours - user.overtime_hours).toFixed(1)}h
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-yellow-600">+{user.overtime_hours.toFixed(1)}h</p>
                      <p className="text-sm text-muted-foreground">Overtime</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-6">
                  No overtime hours recorded
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Breakdown (for selected user or top projects) */}
      {selectedUser && (
        <Card>
          <CardHeader>
            <CardTitle>
              Project Breakdown - {userAnalytics.find(u => u.user_id === selectedUser)?.user_name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userAnalytics
                .find(u => u.user_id === selectedUser)
                ?.project_breakdown.map((project) => (
                  <div key={project.project_name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{project.project_name}</p>
                      <div className="w-full bg-muted rounded-full h-2 mt-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${project.percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-bold">{project.hours.toFixed(1)}h</p>
                      <p className="text-sm text-muted-foreground">{project.percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
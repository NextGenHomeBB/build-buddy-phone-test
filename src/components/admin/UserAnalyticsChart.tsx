import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";

interface UserAnalytics {
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
}

interface UserAnalyticsChartProps {
  analytics: UserAnalytics[];
  selectedUser: string | null;
  onUserChange: (userId: string | null) => void;
  viewPeriod: 'daily' | 'weekly' | 'monthly';
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))', 'hsl(var(--destructive))'];

export function UserAnalyticsChart({ analytics, selectedUser, onUserChange, viewPeriod }: UserAnalyticsChartProps) {
  const selectedUserData = analytics.find(u => u.user_id === selectedUser);

  const getTrendData = () => {
    if (!selectedUserData) return [];
    
    switch (viewPeriod) {
      case 'daily':
        return selectedUserData.daily_hours;
      case 'weekly':
        return selectedUserData.weekly_trend;
      case 'monthly':
        return selectedUserData.monthly_trend;
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6">
      {/* User Selection */}
      <Card>
        <CardHeader>
          <CardTitle>User Selection</CardTitle>
          <CardDescription>Select a user to view detailed analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedUser || 'all'} onValueChange={(value) => onUserChange(value === 'all' ? null : value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select user..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              {analytics.map(user => (
                <SelectItem key={user.user_id} value={user.user_id}>
                  {user.user_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedUserData ? (
        <>
          {/* Time Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Hours Worked - {viewPeriod.charAt(0).toUpperCase() + viewPeriod.slice(1)} Trend</CardTitle>
              <CardDescription>{selectedUserData.user_name}'s work hours over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getTrendData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey={viewPeriod === 'monthly' ? 'month' : viewPeriod === 'weekly' ? 'week' : 'date'}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="hours" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Project Time Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Project Time Distribution</CardTitle>
              <CardDescription>How {selectedUserData.user_name} spends time across projects</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={selectedUserData.project_breakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ project_name, percentage }) => `${project_name}: ${percentage.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="hours"
                  >
                    {selectedUserData.project_breakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      ) : (
        /* All Users Overview */
        <Card>
          <CardHeader>
            <CardTitle>Team Overview</CardTitle>
            <CardDescription>Performance comparison across all team members</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="user_name" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total_hours" fill="hsl(var(--primary))" name="Total Hours" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
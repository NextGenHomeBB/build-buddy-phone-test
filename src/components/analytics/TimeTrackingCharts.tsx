import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

interface DailyTrend {
  date: string;
  hours: number;
  cost: number;
  workers: number;
}

interface ProjectTimeAllocation {
  project_id: string;
  project_name: string;
  total_hours: number;
  total_cost: number;
  worker_count: number;
  color: string;
}

interface WorkerProductivity {
  user_id: string;
  user_name: string;
  total_hours: number;
  avg_hourly_rate: number;
  shifts_count: number;
  location_verified_rate: number;
  total_earnings: number;
}

interface TimeTrackingChartsProps {
  dailyTrends: DailyTrend[];
  projectTimeAllocation: ProjectTimeAllocation[];
  workerProductivity: WorkerProductivity[];
}

export const TimeTrackingCharts = ({ 
  dailyTrends, 
  projectTimeAllocation, 
  workerProductivity 
}: TimeTrackingChartsProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatCurrency = (value: number) => `€${value.toFixed(0)}`;
  const formatHours = (value: number) => `${value.toFixed(1)}h`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Daily Hours & Cost Trend */}
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle>Daily Time & Cost Trends</CardTitle>
          <CardDescription>Track daily hours worked and labor costs over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyTrends}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  className="text-muted-foreground"
                />
                <YAxis 
                  yAxisId="hours"
                  orientation="left"
                  tickFormatter={formatHours}
                  className="text-muted-foreground"
                />
                <YAxis 
                  yAxisId="cost"
                  orientation="right"
                  tickFormatter={formatCurrency}
                  className="text-muted-foreground"
                />
                <Tooltip 
                  formatter={(value: number, name: string) => {
                    if (name === 'hours') return [formatHours(value), 'Hours Worked'];
                    if (name === 'cost') return [formatCurrency(value), 'Labor Cost'];
                    if (name === 'workers') return [value, 'Active Workers'];
                    return [value, name];
                  }}
                  labelFormatter={(label) => formatDate(label)}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Line 
                  yAxisId="hours"
                  type="monotone" 
                  dataKey="hours" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
                <Line 
                  yAxisId="cost"
                  type="monotone" 
                  dataKey="cost" 
                  stroke="hsl(var(--secondary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--secondary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Project Time Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Project Time Allocation</CardTitle>
          <CardDescription>Hours worked per project</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectTimeAllocation}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="total_hours"
                >
                  {projectTimeAllocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [formatHours(value), 'Hours']}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {projectTimeAllocation.slice(0, 4).map((project, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: project.color }}
                  />
                  <span className="truncate max-w-[120px]">{project.project_name}</span>
                </div>
                <span className="font-medium">{formatHours(project.total_hours)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Worker Productivity */}
      <Card>
        <CardHeader>
          <CardTitle>Worker Productivity</CardTitle>
          <CardDescription>Top workers by hours worked</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workerProductivity.slice(0, 6)} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis 
                  type="number" 
                  tickFormatter={formatHours}
                  className="text-muted-foreground"
                />
                <YAxis 
                  type="category" 
                  dataKey="user_name" 
                  width={80}
                  className="text-muted-foreground"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value: number) => [formatHours(value), 'Hours Worked']}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Bar 
                  dataKey="total_hours" 
                  fill="hsl(var(--primary))"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
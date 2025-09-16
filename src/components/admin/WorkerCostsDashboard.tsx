import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar,
  AlertTriangle,
  Clock,
  Target
} from "lucide-react";

interface WorkerCostsDashboardProps {
  stats: {
    totalWorkers: number;
    totalMonthlyPay: number;
    averageHourlyRate: number;
    pendingPayments: number;
  };
}

export function WorkerCostsDashboard({ stats }: WorkerCostsDashboardProps) {
  // Mock additional data for enhanced dashboard
  const monthlyBudget = 50000;
  const budgetUtilization = (stats.totalMonthlyPay / monthlyBudget) * 100;
  const previousMonthPay = 42000;
  const payrollGrowth = ((stats.totalMonthlyPay - previousMonthPay) / previousMonthPay) * 100;
  const overtimeHours = 128;
  const averageProductivity = 87;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Workers */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Workers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalWorkers}</div>
          <p className="text-xs text-muted-foreground">
            Active employees
          </p>
          <div className="mt-2">
            <Badge variant="secondary" className="text-xs">
              +2 this month
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Payroll */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Payroll</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${stats.totalMonthlyPay.toLocaleString()}</div>
          <div className="flex items-center gap-1 text-xs">
            {payrollGrowth >= 0 ? (
              <TrendingUp className="h-3 w-3 text-success" />
            ) : (
              <TrendingDown className="h-3 w-3 text-destructive" />
            )}
            <span className={payrollGrowth >= 0 ? "text-success" : "text-destructive"}>
              {Math.abs(payrollGrowth).toFixed(1)}% from last month
            </span>
          </div>
          <div className="mt-2">
            <Progress value={budgetUtilization} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {budgetUtilization.toFixed(1)}% of monthly budget
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Average Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Rate</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${stats.averageHourlyRate.toFixed(0)}/hr</div>
          <p className="text-xs text-muted-foreground">
            Across all workers
          </p>
          <div className="mt-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Min: $35/hr</span>
              <span>Max: $85/hr</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Payments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pendingPayments}</div>
          <p className="text-xs text-muted-foreground">
            Awaiting processing
          </p>
          {stats.pendingPayments > 0 && (
            <div className="mt-2">
              <Badge variant="destructive" className="text-xs">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Action required
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Overtime Hours - Spans 2 columns */}
      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Overtime Analysis</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold">{overtimeHours}h</div>
              <p className="text-xs text-muted-foreground">Total overtime this month</p>
            </div>
            <div>
              <div className="text-2xl font-bold">
                ${((overtimeHours * stats.averageHourlyRate * 1.5)).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Overtime cost (1.5x rate)</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-muted-foreground">Overtime vs Regular</span>
              <span className="text-xs font-medium">
                {((overtimeHours / (stats.totalWorkers * 160)) * 100).toFixed(1)}%
              </span>
            </div>
            <Progress value={(overtimeHours / (stats.totalWorkers * 160)) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Productivity - Spans 2 columns */}
      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Team Productivity</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold">{averageProductivity}%</div>
              <p className="text-xs text-muted-foreground">Average productivity score</p>
            </div>
            <div>
              <div className="text-2xl font-bold">
                ${(stats.totalMonthlyPay / stats.totalWorkers).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Cost per worker</p>
            </div>
          </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Top Performers</span>
                <Badge variant="default" className="text-xs">12 workers (95%+)</Badge>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Needs Improvement</span>
                <Badge variant="destructive" className="text-xs">3 workers (&lt;75%)</Badge>
              </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
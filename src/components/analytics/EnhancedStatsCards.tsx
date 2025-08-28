import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  DollarSign, 
  TrendingUp, 
  MapPin, 
  AlertTriangle, 
  Users, 
  CheckCircle,
  Activity
} from "lucide-react";

interface TimeTrackingStats {
  totalHours: number;
  totalCost: number;
  avgHourlyRate: number;
  locationVerificationRate: number;
  overtimeHours: number;
  activeWorkers: number;
  pendingApprovals: number;
  approvalRate: number;
}

interface EnhancedStatsCardsProps {
  stats: TimeTrackingStats;
  activeShiftsCount: number;
  todayEntriesCount: number;
}

export const EnhancedStatsCards = ({ 
  stats, 
  activeShiftsCount, 
  todayEntriesCount 
}: EnhancedStatsCardsProps) => {
  const formatCurrency = (value: number) => `€${value.toFixed(0)}`;
  const formatHours = (value: number) => `${value.toFixed(1)}h`;
  const formatPercentage = (value: number) => `${value.toFixed(0)}%`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Active Shifts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Shifts</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeShiftsCount}</div>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={activeShiftsCount > 0 ? "default" : "outline"}>
              {activeShiftsCount > 0 ? "Live" : "None"}
            </Badge>
            <p className="text-xs text-muted-foreground">Currently working</p>
          </div>
        </CardContent>
      </Card>

      {/* Total Hours */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatHours(stats.totalHours)}</div>
          <div className="flex items-center gap-2 mt-1">
            {stats.overtimeHours > 0 && (
              <Badge variant="destructive">
                {formatHours(stats.overtimeHours)} OT
              </Badge>
            )}
            <p className="text-xs text-muted-foreground">Period total</p>
          </div>
        </CardContent>
      </Card>

      {/* Total Cost */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Labor Cost</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.totalCost)}</div>
          <div className="flex items-center gap-2 mt-1">
            <TrendingUp className="h-3 w-3 text-green-500" />
            <p className="text-xs text-muted-foreground">
              Avg {formatCurrency(stats.avgHourlyRate)}/hr
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Location Verification */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Location Verified</CardTitle>
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatPercentage(stats.locationVerificationRate)}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Badge 
              variant={stats.locationVerificationRate > 80 ? "default" : "destructive"}
            >
              {stats.locationVerificationRate > 80 ? "Good" : "Poor"}
            </Badge>
            <p className="text-xs text-muted-foreground">GPS accuracy</p>
          </div>
        </CardContent>
      </Card>

      {/* Active Workers */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Workers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeWorkers}</div>
          <p className="text-xs text-muted-foreground">
            {todayEntriesCount} total entries
          </p>
        </CardContent>
      </Card>

      {/* Pending Approvals */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
          <div className="flex items-center gap-2 mt-1">
            <Badge 
              variant={stats.pendingApprovals > 5 ? "destructive" : "outline"}
            >
              {stats.pendingApprovals > 5 ? "High" : "Normal"}
            </Badge>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </div>
        </CardContent>
      </Card>

      {/* Approval Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatPercentage(stats.approvalRate)}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Badge 
              variant={stats.approvalRate > 90 ? "default" : "outline"}
            >
              {stats.approvalRate > 90 ? "Excellent" : "Good"}
            </Badge>
            <p className="text-xs text-muted-foreground">Auto-approved</p>
          </div>
        </CardContent>
      </Card>

      {/* Overtime Alert */}
      {stats.overtimeHours > 0 && (
        <Card className="border-destructive">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-destructive">
              Overtime Alert
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatHours(stats.overtimeHours)}
            </div>
            <p className="text-xs text-muted-foreground">
              Exceeds standard hours
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
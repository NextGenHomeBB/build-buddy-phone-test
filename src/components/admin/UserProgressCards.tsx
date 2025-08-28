import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, Target, TrendingUp, Calendar, Award } from "lucide-react";

interface UserProgress {
  user_id: string;
  user_name: string;
  daily_goal: number;
  weekly_goal: number;
  monthly_goal: number;
  current_daily_hours: number;
  current_weekly_hours: number;
  current_monthly_hours: number;
  streak_days: number;
  total_projects: number;
  completion_rate: number;
}

interface UserProgressCardsProps {
  userProgress: UserProgress[];
  selectedUser: string | null;
}

export function UserProgressCards({ userProgress, selectedUser }: UserProgressCardsProps) {
  const selectedUserProgress = selectedUser 
    ? userProgress.find(u => u.user_id === selectedUser)
    : null;

  const topPerformers = userProgress
    .sort((a, b) => b.current_monthly_hours - a.current_monthly_hours)
    .slice(0, 3);

  if (selectedUser && selectedUserProgress) {
    return (
      <div className="space-y-6">
        {/* Selected User Progress */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Progress</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {selectedUserProgress.current_daily_hours.toFixed(1)}h
              </div>
              <p className="text-xs text-muted-foreground">
                Goal: {selectedUserProgress.daily_goal}h
              </p>
              <Progress 
                value={(selectedUserProgress.current_daily_hours / selectedUserProgress.daily_goal) * 100}
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weekly Progress</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {selectedUserProgress.current_weekly_hours.toFixed(1)}h
              </div>
              <p className="text-xs text-muted-foreground">
                Goal: {selectedUserProgress.weekly_goal}h
              </p>
              <Progress 
                value={(selectedUserProgress.current_weekly_hours / selectedUserProgress.weekly_goal) * 100}
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {selectedUserProgress.current_monthly_hours.toFixed(1)}h
              </div>
              <p className="text-xs text-muted-foreground">
                Goal: {selectedUserProgress.monthly_goal}h
              </p>
              <Progress 
                value={(selectedUserProgress.current_monthly_hours / selectedUserProgress.monthly_goal) * 100}
                className="mt-2"
              />
            </CardContent>
          </Card>
        </div>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>{selectedUserProgress.user_name}'s current achievements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Work Streak</p>
                  <p className="text-2xl font-bold">{selectedUserProgress.streak_days}</p>
                  <p className="text-xs text-muted-foreground">days</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Completion Rate</p>
                  <p className="text-2xl font-bold">{selectedUserProgress.completion_rate.toFixed(0)}%</p>
                  <p className="text-xs text-muted-foreground">this month</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Avg Daily</p>
                  <p className="text-2xl font-bold">
                    {(selectedUserProgress.current_weekly_hours / 7).toFixed(1)}h
                  </p>
                  <p className="text-xs text-muted-foreground">per day</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <Badge variant={selectedUserProgress.completion_rate >= 100 ? "default" : "outline"}>
                    {selectedUserProgress.completion_rate >= 100 ? "On Track" : "Behind Goal"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Team Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Team Performance</CardTitle>
          <CardDescription>Top performers this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPerformers.map((user, index) => (
              <div key={user.user_id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{user.user_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {user.current_monthly_hours.toFixed(1)}h this month
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={user.completion_rate >= 100 ? "default" : "outline"}>
                    {user.completion_rate.toFixed(0)}%
                  </Badge>
                  {user.streak_days >= 7 && (
                    <Badge variant="secondary">
                      {user.streak_days} day streak
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Team Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userProgress.reduce((sum, user) => sum + user.current_monthly_hours, 0).toFixed(1)}h
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Completion</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userProgress.length > 0 
                ? (userProgress.reduce((sum, user) => sum + user.completion_rate, 0) / userProgress.length).toFixed(0)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Team average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Workers</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userProgress.filter(user => user.current_monthly_hours > 0).length}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { TrendingUp, TrendingDown, Target, Award, Calendar } from 'lucide-react';

interface ProgressReportProps {
  userProgress: Array<{
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
  }>;
}

export const ProgressReport: React.FC<ProgressReportProps> = ({
  userProgress,
}) => {
  const totalUsers = userProgress.length;
  const usersOnTrack = userProgress.filter(user => 
    (user.current_daily_hours / user.daily_goal) >= 0.8
  ).length;
  const avgCompletionRate = totalUsers > 0 
    ? userProgress.reduce((sum, user) => sum + user.completion_rate, 0) / totalUsers
    : 0;
  const longestStreak = Math.max(...userProgress.map(user => user.streak_days), 0);

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'text-green-600';
    if (percentage >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressBadge = (percentage: number) => {
    if (percentage >= 100) return <Badge className="bg-green-100 text-green-800">Achieved</Badge>;
    if (percentage >= 80) return <Badge className="bg-yellow-100 text-yellow-800">On Track</Badge>;
    return <Badge className="bg-red-100 text-red-800">Behind</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Users On Track</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usersOnTrack}/{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {totalUsers > 0 ? ((usersOnTrack / totalUsers) * 100).toFixed(1) : 0}% of team
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgCompletionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Team average</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Longest Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{longestStreak}</div>
            <p className="text-xs text-muted-foreground">Days consecutive</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userProgress.reduce((sum, user) => sum + user.total_projects, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Across all users</p>
          </CardContent>
        </Card>
      </div>

      {/* Individual Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Progress Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {userProgress.map((user) => {
              const dailyProgress = (user.current_daily_hours / user.daily_goal) * 100;
              const weeklyProgress = (user.current_weekly_hours / user.weekly_goal) * 100;
              const monthlyProgress = (user.current_monthly_hours / user.monthly_goal) * 100;
              
              return (
                <div key={user.user_id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>{user.user_name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.user_name}</p>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{user.streak_days} day streak</span>
                          <Target className="h-3 w-3 ml-2" />
                          <span>{user.total_projects} projects</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {user.completion_rate >= 90 && <Award className="h-5 w-5 text-yellow-500" />}
                      <Badge variant="outline">{user.completion_rate.toFixed(1)}% completion</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Daily Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Daily Goal</span>
                        {getProgressBadge(dailyProgress)}
                      </div>
                      <Progress value={Math.min(dailyProgress, 100)} className="h-2" />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{user.current_daily_hours.toFixed(1)}h / {user.daily_goal}h</span>
                        <span className={getProgressColor(dailyProgress)}>
                          {dailyProgress.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    {/* Weekly Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Weekly Goal</span>
                        {getProgressBadge(weeklyProgress)}
                      </div>
                      <Progress value={Math.min(weeklyProgress, 100)} className="h-2" />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{user.current_weekly_hours.toFixed(1)}h / {user.weekly_goal}h</span>
                        <span className={getProgressColor(weeklyProgress)}>
                          {weeklyProgress.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    {/* Monthly Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Monthly Goal</span>
                        {getProgressBadge(monthlyProgress)}
                      </div>
                      <Progress value={Math.min(monthlyProgress, 100)} className="h-2" />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{user.current_monthly_hours.toFixed(1)}h / {user.monthly_goal}h</span>
                        <span className={getProgressColor(monthlyProgress)}>
                          {monthlyProgress.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Performance Indicators */}
                  <div className="flex items-center space-x-4 pt-2 border-t">
                    <div className="flex items-center space-x-1">
                      {dailyProgress >= 100 ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-sm text-muted-foreground">
                        Daily: {dailyProgress >= 100 ? 'Ahead' : 'Behind'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {weeklyProgress >= 80 ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-sm text-muted-foreground">
                        Weekly: {weeklyProgress >= 80 ? 'On Track' : 'Needs Attention'}
                      </span>
                    </div>
                    {user.streak_days >= 7 && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Hot Streak! 🔥
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
            {userProgress.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No progress data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Goals Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Goal Achievement Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <h4 className="font-medium mb-2">Daily Goals</h4>
              <div className="text-3xl font-bold text-green-600">
                {userProgress.filter(user => (user.current_daily_hours / user.daily_goal) >= 1).length}
              </div>
              <p className="text-sm text-muted-foreground">Users achieved today</p>
            </div>
            <div className="text-center">
              <h4 className="font-medium mb-2">Weekly Goals</h4>
              <div className="text-3xl font-bold text-blue-600">
                {userProgress.filter(user => (user.current_weekly_hours / user.weekly_goal) >= 1).length}
              </div>
              <p className="text-sm text-muted-foreground">Users achieved this week</p>
            </div>
            <div className="text-center">
              <h4 className="font-medium mb-2">Monthly Goals</h4>
              <div className="text-3xl font-bold text-purple-600">
                {userProgress.filter(user => (user.current_monthly_hours / user.monthly_goal) >= 1).length}
              </div>
              <p className="text-sm text-muted-foreground">Users achieved this month</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
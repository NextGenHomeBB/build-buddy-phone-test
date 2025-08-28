import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, BellRing, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface PendingApprovalNotification {
  id: string;
  timesheet_id: string;
  user_name: string;
  project_name: string;
  hours: number;
  earnings: number;
  priority: 'high' | 'medium' | 'low';
  created_at: string;
  location_verified: boolean;
}

interface ApprovalNotificationSystemProps {
  onNavigateToTimesheet: (timesheetId: string) => void;
}

export const ApprovalNotificationSystem = ({
  onNavigateToTimesheet
}: ApprovalNotificationSystemProps) => {
  const [notifications, setNotifications] = useState<PendingApprovalNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchPendingApprovals = async () => {
    try {
      // Get timesheets pending approval
      const { data: timesheets, error } = await supabase
        .from('timesheets')
        .select(`
          id,
          user_id,
          project_id,
          duration_generated,
          total_earnings,
          location_verified,
          created_at
        `)
        .eq('approved', false)
        .not('end_time', 'is', null)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Get user and project names
      const userIds = [...new Set(timesheets?.map(t => t.user_id) || [])];
      const projectIds = [...new Set(timesheets?.filter(t => t.project_id).map(t => t.project_id) || [])];

      const [profilesResponse, projectsResponse] = await Promise.all([
        supabase.from('profiles').select('user_id, name').in('user_id', userIds),
        projectIds.length > 0 
          ? supabase.from('projects').select('id, name').in('id', projectIds)
          : { data: [] }
      ]);

      const profiles = profilesResponse.data || [];
      const projects = projectsResponse.data || [];

      const pendingNotifications: PendingApprovalNotification[] = timesheets?.map(timesheet => {
        const hours = timesheet.duration_generated || 0;
        const earnings = timesheet.total_earnings || 0;
        
        // Calculate priority
        let priority: 'high' | 'medium' | 'low' = 'low';
        if (hours > 8 || earnings > 200 || !timesheet.location_verified) {
          priority = 'high';
        } else if (earnings > 100 || hours > 6) {
          priority = 'medium';
        }

        return {
          id: timesheet.id,
          timesheet_id: timesheet.id,
          user_name: profiles.find(p => p.user_id === timesheet.user_id)?.name || 'Unknown User',
          project_name: projects.find(p => p.id === timesheet.project_id)?.name || 'No Project',
          hours,
          earnings,
          priority,
          created_at: timesheet.created_at,
          location_verified: timesheet.location_verified
        };
      }) || [];

      setNotifications(pendingNotifications);
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsViewed = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const getNotificationIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-primary" />;
      default:
        return <CheckCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive' as const;
      case 'medium':
        return 'default' as const;
      default:
        return 'outline' as const;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const created = new Date(dateString);
    const diffInHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return `${Math.floor(diffInHours * 60)}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return `${Math.floor(diffInHours / 24)}d ago`;
    }
  };

  useEffect(() => {
    fetchPendingApprovals();
    
    // Set up real-time listener for new pending approvals
    const channel = supabase
      .channel('pending-approvals')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'timesheets'
      }, () => {
        fetchPendingApprovals();
      })
      .subscribe();

    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchPendingApprovals, 5 * 60 * 1000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  // Show toast for high priority notifications
  useEffect(() => {
    const highPriorityNotifications = notifications.filter(n => n.priority === 'high');
    if (highPriorityNotifications.length > 0) {
      toast({
        title: "High Priority Approvals",
        description: `${highPriorityNotifications.length} high-priority timesheets need approval`,
        variant: "destructive"
      });
    }
  }, [notifications]);

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative"
      >
        {notifications.length > 0 ? (
          <BellRing className="h-4 w-4" />
        ) : (
          <Bell className="h-4 w-4" />
        )}
        {notifications.length > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
          >
            {notifications.length > 99 ? '99+' : notifications.length}
          </Badge>
        )}
      </Button>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <Card className="absolute right-0 top-full mt-2 w-80 z-50 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center justify-between">
              Pending Approvals
              {notifications.length > 0 && (
                <Badge variant="outline">{notifications.length}</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Timesheets awaiting your approval
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No pending approvals
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto">
                {notifications.slice(0, 5).map((notification) => (
                  <div 
                    key={notification.id}
                    className="p-3 border-b border-border hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => {
                      onNavigateToTimesheet(notification.timesheet_id);
                      markAsViewed(notification.id);
                      setShowNotifications(false);
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2">
                        {getNotificationIcon(notification.priority)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {notification.user_name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {notification.project_name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge 
                              variant={getPriorityBadgeVariant(notification.priority)}
                              className="text-xs"
                            >
                              {notification.priority}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {notification.hours.toFixed(1)}h • €{notification.earnings.toFixed(0)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(notification.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {notifications.length > 5 && (
              <div className="p-3 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => setShowNotifications(false)}
                >
                  View All ({notifications.length})
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
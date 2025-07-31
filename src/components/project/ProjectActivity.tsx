import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, CheckCircle, AlertCircle, User, FileText, Settings, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface ProjectActivityProps {
  projectId: string;
}

interface ActivityItem {
  id: string;
  type: 'task_created' | 'task_completed' | 'task_assigned' | 'phase_updated' | 'project_updated' | 'material_added' | 'labour_added';
  description: string;
  user_name?: string;
  user_avatar?: string;
  created_at: string;
  metadata?: any;
}

const getActivityIcon = (type: ActivityItem['type']) => {
  switch (type) {
    case 'task_created':
      return <Plus className="h-4 w-4" />;
    case 'task_completed':
      return <CheckCircle className="h-4 w-4" />;
    case 'task_assigned':
      return <User className="h-4 w-4" />;
    case 'phase_updated':
      return <Settings className="h-4 w-4" />;
    case 'project_updated':
      return <FileText className="h-4 w-4" />;
    case 'material_added':
      return <AlertCircle className="h-4 w-4" />;
    case 'labour_added':
      return <Clock className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

const getActivityColor = (type: ActivityItem['type']) => {
  switch (type) {
    case 'task_created':
      return 'bg-blue-500';
    case 'task_completed':
      return 'bg-green-500';
    case 'task_assigned':
      return 'bg-purple-500';
    case 'phase_updated':
      return 'bg-orange-500';
    case 'project_updated':
      return 'bg-indigo-500';
    case 'material_added':
      return 'bg-yellow-500';
    case 'labour_added':
      return 'bg-pink-500';
    default:
      return 'bg-gray-500';
  }
};

export function ProjectActivity({ projectId }: ProjectActivityProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true);
      
      try {
        // Fetch recent activities for this project
        const activities: ActivityItem[] = [];

        // Get recent tasks
        const { data: tasks } = await supabase
          .from('tasks')
          .select(`
            id, title, status, created_at, updated_at, assigned_to
          `)
          .eq('project_id', projectId)
          .order('created_at', { ascending: false })
          .limit(10);

        if (tasks) {
          for (const task of tasks) {
            // Task created
            activities.push({
              id: `task_created_${task.id}`,
              type: 'task_created',
              description: `Created task "${task.title}"`,
              created_at: task.created_at,
            });

            // Task completed (if status is completed)
            if (task.status === 'completed') {
              activities.push({
                id: `task_completed_${task.id}`,
                type: 'task_completed',
                description: `Completed task "${task.title}"`,
                created_at: task.updated_at,
              });
            }

            // Task assigned (if has assignee)
            if (task.assigned_to) {
              // Get assignee details
              const { data: assignee } = await supabase
                .from('profiles')
                .select('name, avatar_url')
                .eq('user_id', task.assigned_to)
                .single();

              if (assignee) {
                activities.push({
                  id: `task_assigned_${task.id}`,
                  type: 'task_assigned',
                  description: `Assigned task "${task.title}" to ${assignee.name}`,
                  user_name: assignee.name,
                  user_avatar: assignee.avatar_url,
                  created_at: task.created_at,
                });
              }
            }
          }
        }

        // Get recent phase updates
        const { data: phases } = await supabase
          .from('project_phases')
          .select('id, name, status, created_at, updated_at')
          .eq('project_id', projectId)
          .order('updated_at', { ascending: false })
          .limit(5);

        if (phases) {
          phases.forEach(phase => {
            activities.push({
              id: `phase_updated_${phase.id}`,
              type: 'phase_updated',
              description: `Updated phase "${phase.name}" status to ${phase.status}`,
              created_at: phase.updated_at,
            });
          });
        }

        // Get project phases first to filter material and labour costs
        const projectPhaseIds = phases?.map(p => p.id) || [];

        // Get recent material costs for this project's phases
        if (projectPhaseIds.length > 0) {
          const { data: materialCosts } = await supabase
            .from('material_costs')
            .select(`
              id, category, total, created_at, phase_id,
              phase:project_phases(name)
            `)
            .in('phase_id', projectPhaseIds)
            .order('created_at', { ascending: false })
            .limit(5);

          if (materialCosts) {
            materialCosts.forEach(cost => {
              activities.push({
                id: `material_added_${cost.id}`,
                type: 'material_added',
                description: `Added material cost "${cost.category}" (€${cost.total}) to ${cost.phase?.name || 'project'}`,
                created_at: cost.created_at,
              });
            });
          }

          // Get recent labour costs for this project's phases
          const { data: labourCosts } = await supabase
            .from('labour_costs')
            .select(`
              id, task, total, created_at, phase_id,
              phase:project_phases(name)
            `)
            .in('phase_id', projectPhaseIds)
            .order('created_at', { ascending: false })
            .limit(5);

          if (labourCosts) {
            labourCosts.forEach(cost => {
              activities.push({
                id: `labour_added_${cost.id}`,
                type: 'labour_added',
                description: `Added labour cost "${cost.task}" (€${cost.total}) to ${cost.phase?.name || 'project'}`,
                created_at: cost.created_at,
              });
            });
          }
        }

        // Sort all activities by date
        activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        
        setActivities(activities.slice(0, 20)); // Limit to latest 20 activities
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [projectId]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Activity Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Loading activities...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Activity Feed
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No recent activity found for this project.
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border">
                <div className={`p-2 rounded-full ${getActivityColor(activity.type)} text-white`}>
                  {getActivityIcon(activity.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {activity.user_name && (
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={activity.user_avatar} />
                        <AvatarFallback className="text-xs">
                          {activity.user_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <span className="font-medium text-sm">
                      {activity.user_name || 'System'}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {activity.type.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mt-1">
                    {activity.description}
                  </p>
                  
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { WorkerAvailabilityDashboard } from '@/components/availability/WorkerAvailabilityDashboard';
import { TeamAvailabilityOverview } from '@/components/availability/TeamAvailabilityOverview';
import AvailabilityApprovalQueue from '@/components/availability/AvailabilityApprovalQueue';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import { useTeamAvailability } from '@/hooks/useTeamAvailability';

export default function WorkerAvailability() {
  const { isWorker, hasAdminAccess } = useRoleAccess();
  const navigate = useNavigate();
  const { pendingRequests, pendingOverrides } = useTeamAvailability();

  if (isWorker()) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">My Availability</h1>
          <p className="text-muted-foreground">
            Manage your work schedule, request time off, and set availability preferences.
          </p>
        </div>
        
        <WorkerAvailabilityDashboard />
      </div>
    );
  }

  if (hasAdminAccess()) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Team Availability Management</h1>
          <p className="text-muted-foreground">
            Overview of team availability, approve time off requests, and manage schedules.
          </p>
        </div>
        
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Team Overview</TabsTrigger>
            <TabsTrigger value="approvals" className="flex items-center gap-2">
              Approval Queue
              {(pendingRequests?.length || 0) + (pendingOverrides?.length || 0) > 0 && (
                <Badge variant="destructive">
                  {(pendingRequests?.length || 0) + (pendingOverrides?.length || 0)}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <TeamAvailabilityOverview />
          </TabsContent>

          <TabsContent value="approvals">
            <AvailabilityApprovalQueue />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-muted-foreground">Access Denied</h1>
        <p className="text-muted-foreground">You don't have permission to view this page.</p>
      </div>
    </div>
  );
}
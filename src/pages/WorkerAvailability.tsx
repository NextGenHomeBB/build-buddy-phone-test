import React from 'react';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { WorkerAvailabilityDashboard } from '@/components/availability/WorkerAvailabilityDashboard';
import { TeamAvailabilityOverview } from '@/components/availability/TeamAvailabilityOverview';
import { TimeOffApprovalQueue } from '@/components/availability/TimeOffApprovalQueue';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function WorkerAvailability() {
  const { isWorker, hasAdminAccess } = useRoleAccess();

  if (isWorker()) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
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
          <h1 className="text-3xl font-bold tracking-tight">Team Availability Management</h1>
          <p className="text-muted-foreground">
            Overview of team availability, approve time off requests, and manage schedules.
          </p>
        </div>
        
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Team Overview</TabsTrigger>
            <TabsTrigger value="approvals">Approval Queue</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <TeamAvailabilityOverview />
          </TabsContent>

          <TabsContent value="approvals">
            <TimeOffApprovalQueue />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-muted-foreground">Access Denied</h1>
        <p className="text-muted-foreground">You don't have permission to view this page.</p>
      </div>
    </div>
  );
}
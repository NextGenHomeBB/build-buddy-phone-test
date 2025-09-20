import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useTeamAvailability } from '@/hooks/useTeamAvailability';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export const DebugAvailabilityInfo = () => {
  const { profile } = useAuth();
  const { pendingRequests, pendingOverrides, isLoading } = useTeamAvailability();
  
  if (!profile) return null;

  return (
    <Alert className="mb-4">
      <Info className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <strong>Current User:</strong> {profile.name} 
            <Badge variant="outline">{profile.role}</Badge>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span>Pending Time Off: <strong>{pendingRequests?.length || 0}</strong></span>
            <span>Pending Overrides: <strong>{pendingOverrides?.length || 0}</strong></span>
            <span>Loading: <strong>{isLoading ? 'Yes' : 'No'}</strong></span>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};
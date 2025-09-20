import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarDays, Clock, User, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { useTeamAvailability } from '@/hooks/useTeamAvailability';

const AvailabilityApprovalQueue = () => {
  const {
    pendingRequests,
    pendingOverrides,
    processTimeOffRequest,
    processAvailabilityOverride,
    isProcessingRequest,
    isProcessingOverride,
    isLoadingPending,
    isLoadingPendingOverrides
  } = useTeamAvailability();

  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [requestType, setRequestType] = useState<'timeoff' | 'override'>('timeoff');
  const [action, setAction] = useState<'approved' | 'denied'>('approved');
  const [adminNotes, setAdminNotes] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleApproval = (request: any, action: 'approved' | 'denied', type: 'timeoff' | 'override') => {
    setSelectedRequest(request);
    setRequestType(type);
    setAction(action);
    setAdminNotes('');
    setDialogOpen(true);
  };

  const confirmApproval = () => {
    if (!selectedRequest) return;

    if (requestType === 'timeoff') {
      processTimeOffRequest({
        requestId: selectedRequest.id,
        status: action,
        adminNotes: adminNotes || undefined,
      });
    } else {
      processAvailabilityOverride({
        requestId: selectedRequest.id,
        status: action,
        adminNotes: adminNotes || undefined,
      });
    }
    
    setDialogOpen(false);
    setSelectedRequest(null);
    setAdminNotes('');
  };

  const getRequestTypeColor = (type: string) => {
    switch (type) {
      case 'vacation': return 'bg-blue-100 text-blue-800';
      case 'sick_leave': return 'bg-red-100 text-red-800';
      case 'personal': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOverrideTypeColor = (isAvailable: boolean) => {
    return isAvailable 
      ? 'bg-green-100 text-green-800' 
      : 'bg-orange-100 text-orange-800';
  };

  if (isLoadingPending && isLoadingPendingOverrides) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Approval Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading pending requests...</p>
        </CardContent>
      </Card>
    );
  }

  const totalPending = (pendingRequests?.length || 0) + (pendingOverrides?.length || 0);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Approval Queue
            {totalPending > 0 && (
              <Badge variant="destructive">{totalPending}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {totalPending === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No pending requests for approval
            </p>
          ) : (
            <Tabs defaultValue="timeoff" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="timeoff" className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" />
                  Time Off ({pendingRequests?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="availability" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Availability ({pendingOverrides?.length || 0})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="timeoff" className="space-y-4 mt-4">
                {pendingRequests?.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={request.profiles?.avatar_url} />
                          <AvatarFallback>
                            <User className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{request.profiles?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(request.created_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <Badge className={getRequestTypeColor(request.request_type)}>
                        {request.request_type.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">From</p>
                        <p className="font-medium">{format(new Date(request.start_date), 'MMM d, yyyy')}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">To</p>
                        <p className="font-medium">{format(new Date(request.end_date), 'MMM d, yyyy')}</p>
                      </div>
                    </div>

                    {request.reason && (
                      <div>
                        <p className="text-sm text-muted-foreground">Reason</p>
                        <p className="text-sm">{request.reason}</p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleApproval(request, 'approved', 'timeoff')}
                        disabled={isProcessingRequest}
                      >
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleApproval(request, 'denied', 'timeoff')}
                        disabled={isProcessingRequest}
                      >
                        Deny
                      </Button>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="availability" className="space-y-4 mt-4">
                {pendingOverrides?.map((override) => (
                  <div key={override.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={override.profiles?.avatar_url} />
                          <AvatarFallback>
                            <User className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{override.profiles?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(override.created_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <Badge className={getOverrideTypeColor(override.is_available)}>
                        {override.is_available ? 'Available' : 'Unavailable'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Date</p>
                        <p className="font-medium">{format(new Date(override.override_date), 'MMM d, yyyy')}</p>
                      </div>
                      {override.start_time && override.end_time && (
                        <div>
                          <p className="text-muted-foreground">Time</p>
                          <p className="font-medium">{override.start_time} - {override.end_time}</p>
                        </div>
                      )}
                    </div>

                    {override.reason && (
                      <div>
                        <p className="text-sm text-muted-foreground">Reason</p>
                        <p className="text-sm">{override.reason}</p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleApproval(override, 'approved', 'override')}
                        disabled={isProcessingOverride}
                      >
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleApproval(override, 'denied', 'override')}
                        disabled={isProcessingOverride}
                      >
                        Deny
                      </Button>
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === 'approved' ? 'Approve' : 'Deny'} {requestType === 'timeoff' ? 'Time Off' : 'Availability'} Request
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Admin Notes (Optional)</label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add any notes or comments..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmApproval}
              disabled={isProcessingRequest || isProcessingOverride}
              variant={action === 'approved' ? 'default' : 'destructive'}
            >
              {action === 'approved' ? 'Approve' : 'Deny'} Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AvailabilityApprovalQueue;
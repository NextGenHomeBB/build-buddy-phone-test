import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Check, X, Calendar, Clock, User, MessageSquare } from 'lucide-react';
import { useTeamAvailability } from '@/hooks/useTeamAvailability';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const TimeOffApprovalQueue = () => {
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approved' | 'denied'>('approved');
  
  const { pendingRequests, processTimeOffRequest, isProcessingRequest, isLoadingPending } = useTeamAvailability();

  const handleApproval = (request: any, action: 'approved' | 'denied') => {
    setSelectedRequest(request);
    setApprovalAction(action);
    setShowApprovalDialog(true);
  };

  const confirmApproval = () => {
    if (!selectedRequest) return;
    
    processTimeOffRequest({
      requestId: selectedRequest.id,
      status: approvalAction,
      adminNotes: adminNotes.trim() || undefined,
    });
    
    setShowApprovalDialog(false);
    setSelectedRequest(null);
    setAdminNotes('');
  };

  const getRequestTypeColor = (type: string) => {
    switch (type) {
      case 'vacation': return 'bg-blue-100 text-blue-800';
      case 'sick_leave': return 'bg-red-100 text-red-800';
      case 'personal': return 'bg-green-100 text-green-800';
      case 'unpaid': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoadingPending) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Time Off Approval Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-muted rounded-lg"></div>
              </div>
            ))}
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
          Time Off Approval Queue
          {pendingRequests && pendingRequests.length > 0 && (
            <Badge variant="secondary">{pendingRequests.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!pendingRequests || pendingRequests.length === 0 ? (
          <div className="text-center py-8">
            <Check className="h-12 w-12 text-success mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">All caught up!</h3>
            <p className="text-sm text-muted-foreground">No pending time off requests</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((request: any) => (
              <div key={request.id} className="border rounded-lg p-4 space-y-3">
                {/* Request Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={request.profiles?.avatar_url} />
                      <AvatarFallback>
                        {request.profiles?.name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">{request.profiles?.name || 'Unknown User'}</h4>
                      <div className="flex items-center gap-2">
                        <Badge className={getRequestTypeColor(request.request_type)}>
                          {request.request_type.replace('_', ' ')}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {request.days_requested} day{request.days_requested !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right text-sm text-muted-foreground">
                    <div>Requested {format(new Date(request.created_at), 'MMM d, yyyy')}</div>
                  </div>
                </div>

                {/* Request Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {format(new Date(request.start_date), 'MMM d, yyyy')} - {format(new Date(request.end_date), 'MMM d, yyyy')}
                    </span>
                  </div>
                  
                  {request.reason && (
                    <div className="flex items-start gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span className="text-sm">{request.reason}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleApproval(request, 'denied')}
                    disabled={isProcessingRequest}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Deny
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleApproval(request, 'approved')}
                    disabled={isProcessingRequest}
                    className="bg-success hover:bg-success/90 text-success-foreground"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Approval Confirmation Dialog */}
        <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {approvalAction === 'approved' ? 'Approve' : 'Deny'} Time Off Request
              </DialogTitle>
            </DialogHeader>
            
            {selectedRequest && (
              <div className="space-y-4">
                <div className="p-3 bg-muted rounded-lg">
                  <h4 className="font-medium">{selectedRequest.profiles?.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedRequest.request_type.replace('_', ' ')} • {selectedRequest.days_requested} days
                  </p>
                  <p className="text-sm">
                    {format(new Date(selectedRequest.start_date), 'MMM d, yyyy')} - {format(new Date(selectedRequest.end_date), 'MMM d, yyyy')}
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="admin-notes" className="text-sm font-medium">
                    Notes (Optional)
                  </label>
                  <Textarea
                    id="admin-notes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add any notes about this decision..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowApprovalDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmApproval}
                    disabled={isProcessingRequest}
                    variant={approvalAction === 'approved' ? 'default' : 'destructive'}
                  >
                    {isProcessingRequest ? 'Processing...' : 
                     approvalAction === 'approved' ? 'Approve Request' : 'Deny Request'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
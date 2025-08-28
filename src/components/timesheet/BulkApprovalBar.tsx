import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, MessageSquare, Zap, X } from "lucide-react";

interface BulkApprovalBarProps {
  selectedCount: number;
  isProcessing: boolean;
  onBulkApprove: (notes?: string) => Promise<boolean>;
  onBulkReject: (reason: string) => Promise<boolean>;
  onClearSelection: () => void;
  onAutoProcess: () => void;
}

export const BulkApprovalBar = ({
  selectedCount,
  isProcessing,
  onBulkApprove,
  onBulkReject,
  onClearSelection,
  onAutoProcess
}: BulkApprovalBarProps) => {
  const [approvalNotes, setApprovalNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionTemplate, setRejectionTemplate] = useState("");
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);

  const rejectionTemplates = [
    "Location not verified",
    "Excessive hours without approval",
    "Missing required documentation",
    "Suspicious activity detected",
    "Incorrect project assignment",
    "Other (specify below)"
  ];

  const handleBulkApprove = async () => {
    const success = await onBulkApprove(approvalNotes.trim() || undefined);
    if (success) {
      setApprovalNotes("");
      setShowApprovalDialog(false);
    }
  };

  const handleBulkReject = async () => {
    if (!rejectionReason.trim()) return;
    
    const success = await onBulkReject(rejectionReason.trim());
    if (success) {
      setRejectionReason("");
      setRejectionTemplate("");
      setShowRejectionDialog(false);
    }
  };

  const handleTemplateSelect = (template: string) => {
    setRejectionTemplate(template);
    if (template !== "Other (specify below)") {
      setRejectionReason(template);
    } else {
      setRejectionReason("");
    }
  };

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-card border border-border rounded-lg shadow-lg px-6 py-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{selectedCount} selected</Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* Bulk Approve */}
          <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
            <DialogTrigger asChild>
              <Button 
                size="sm" 
                disabled={isProcessing}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Approve All
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Bulk Approve Timesheets</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  You are about to approve {selectedCount} timesheet{selectedCount > 1 ? 's' : ''}. 
                  Add optional notes below:
                </p>
                <Textarea
                  placeholder="Optional approval notes..."
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  className="min-h-[80px]"
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleBulkApprove}
                    disabled={isProcessing}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isProcessing ? "Processing..." : "Approve All"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Bulk Reject */}
          <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
            <DialogTrigger asChild>
              <Button 
                size="sm" 
                variant="destructive" 
                disabled={isProcessing}
              >
                <XCircle className="w-4 h-4 mr-1" />
                Reject All
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Bulk Reject Timesheets</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  You are about to reject {selectedCount} timesheet{selectedCount > 1 ? 's' : ''}. 
                  Please provide a reason:
                </p>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Common Reasons:</label>
                  <Select value={rejectionTemplate} onValueChange={handleTemplateSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a reason template" />
                    </SelectTrigger>
                    <SelectContent>
                      {rejectionTemplates.map((template) => (
                        <SelectItem key={template} value={template}>
                          {template}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Textarea
                  placeholder="Rejection reason (required)..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="min-h-[80px]"
                  required
                />
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowRejectionDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={handleBulkReject}
                    disabled={isProcessing || !rejectionReason.trim()}
                  >
                    {isProcessing ? "Processing..." : "Reject All"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Auto Process */}
          <Button 
            size="sm" 
            variant="outline"
            onClick={onAutoProcess}
            disabled={isProcessing}
          >
            <Zap className="w-4 w-4 mr-1" />
            Auto Process
          </Button>
        </div>
      </div>
    </div>
  );
};
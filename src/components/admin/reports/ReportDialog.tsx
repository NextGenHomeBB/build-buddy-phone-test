import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const ReportDialog: React.FC<ReportDialogProps> = ({
  open,
  onOpenChange,
  title,
  children,
  className = "max-w-6xl"
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={className}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};
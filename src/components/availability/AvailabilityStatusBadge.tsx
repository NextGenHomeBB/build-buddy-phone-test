import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

interface AvailabilityStatusBadgeProps {
  status: 'pending' | 'approved' | 'denied';
  className?: string;
}

export const AvailabilityStatusBadge: React.FC<AvailabilityStatusBadgeProps> = ({ 
  status, 
  className = "" 
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          label: 'Pending',
          variant: 'secondary' as const,
          className: 'bg-orange-100 text-orange-800'
        };
      case 'approved':
        return {
          icon: CheckCircle,
          label: 'Approved',
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800'
        };
      case 'denied':
        return {
          icon: XCircle,
          label: 'Denied',
          variant: 'destructive' as const,
          className: 'bg-red-100 text-red-800'
        };
      default:
        return {
          icon: Clock,
          label: 'Unknown',
          variant: 'secondary' as const,
          className: 'bg-gray-100 text-gray-800'
        };
    }
  };

  const { icon: Icon, label, className: statusClassName } = getStatusConfig();

  return (
    <Badge className={`${statusClassName} ${className} flex items-center gap-1`}>
      <Icon className="w-3 h-3" />
      {label}
    </Badge>
  );
};
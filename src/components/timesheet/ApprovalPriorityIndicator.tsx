import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, DollarSign, MapPin } from "lucide-react";

interface ApprovalPriorityIndicatorProps {
  priority: 'high' | 'medium' | 'low';
  timesheet: {
    duration_generated?: number;
    total_earnings?: number;
    location_verified: boolean;
  };
  className?: string;
}

export const ApprovalPriorityIndicator = ({ 
  priority, 
  timesheet, 
  className = "" 
}: ApprovalPriorityIndicatorProps) => {
  const hours = timesheet.duration_generated || 0;
  const earnings = timesheet.total_earnings || 0;
  const isOvertime = hours > 8;
  const isHighValue = earnings > 200;
  const isUnverified = !timesheet.location_verified;

  const getPriorityConfig = () => {
    switch (priority) {
      case 'high':
        return {
          variant: 'destructive' as const,
          icon: AlertTriangle,
          label: 'High Priority',
          reasons: [
            isOvertime && 'Overtime',
            isHighValue && 'High Value',
            isUnverified && 'Unverified Location'
          ].filter(Boolean)
        };
      case 'medium':
        return {
          variant: 'default' as const,
          icon: Clock,
          label: 'Medium Priority',
          reasons: [
            earnings > 100 && 'Moderate Value',
            hours > 6 && 'Extended Hours'
          ].filter(Boolean)
        };
      case 'low':
        return {
          variant: 'outline' as const,
          icon: Clock,
          label: 'Standard',
          reasons: ['Standard shift']
        };
    }
  };

  const config = getPriorityConfig();
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
      
      {/* Priority indicators */}
      <div className="flex items-center gap-1">
        {isOvertime && (
          <Badge variant="outline" className="text-xs">
            <Clock className="w-3 h-3 mr-1" />
            {hours.toFixed(1)}h
          </Badge>
        )}
        {isHighValue && (
          <Badge variant="outline" className="text-xs">
            <DollarSign className="w-3 h-3 mr-1" />
            €{earnings.toFixed(0)}
          </Badge>
        )}
        {isUnverified && (
          <Badge variant="destructive" className="text-xs">
            <MapPin className="w-3 h-3 mr-1" />
            Unverified
          </Badge>
        )}
      </div>
      
      {/* Tooltip with reasons */}
      {config.reasons.length > 0 && (
        <div className="hidden group-hover:block absolute z-10 bg-popover text-popover-foreground p-2 rounded border shadow-md text-xs">
          <div className="font-medium mb-1">Priority Reasons:</div>
          <ul className="list-disc list-inside space-y-0.5">
            {config.reasons.map((reason, index) => (
              <li key={index}>{reason}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
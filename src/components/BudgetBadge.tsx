import { Badge } from '@/components/ui/badge';
import { Euro } from 'lucide-react';

interface BudgetBadgeProps {
  amount: number;
  className?: string;
}

export function BudgetBadge({ amount, className }: BudgetBadgeProps) {
  const isNegative = amount < 0;
  const hasNoBudget = amount === 0;
  
  // Don't show badge if there's no budget set
  if (hasNoBudget) {
    return (
      <Badge variant="outline" className={`flex items-center gap-1 ${className}`}>
        <Euro className="h-3 w-3" />
        <span className="text-xs opacity-75">No budget set</span>
      </Badge>
    );
  }
  
  return (
    <Badge 
      variant={isNegative ? "destructive" : "secondary"}
      className={`flex items-center gap-1 ${className}`}
    >
      <Euro className="h-3 w-3" />
      <span className="font-medium">
        €{Math.abs(amount).toLocaleString()}
      </span>
      <span className="text-xs opacity-75">
        {isNegative ? 'over budget' : 'remaining'}
      </span>
    </Badge>
  );
}
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BudgetBadge } from '@/components/BudgetBadge';
import { Badge } from '@/components/ui/badge';
import { Euro, TrendingUp, TrendingDown } from 'lucide-react';
import { EditPhaseBudgetDialog } from '@/components/project/EditPhaseBudgetDialog';
import { Button } from '@/components/ui/button';

interface PhaseBudgetDisplayProps {
  phase: {
    id: string;
    name: string;
    budget: number;
    material_cost?: number;
    labour_cost?: number;
  };
  className?: string;
}

export function PhaseBudgetDisplay({ phase, className }: PhaseBudgetDisplayProps) {
  const materialCost = phase.material_cost || 0;
  const labourCost = phase.labour_cost || 0;
  const totalSpent = materialCost + labourCost;
  const remainingBudget = phase.budget - totalSpent;
  const isOverBudget = remainingBudget < 0;
  const spentPercentage = phase.budget > 0 ? (totalSpent / phase.budget) * 100 : 0;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Euro className="h-4 w-4" />
            Phase Budget
          </CardTitle>
          <BudgetBadge amount={remainingBudget} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-muted-foreground">Budget</div>
            <div className="font-semibold text-lg">€{phase.budget.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="text-muted-foreground">Spent</div>
            <div className="font-semibold text-lg">€{totalSpent.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="text-muted-foreground">Remaining</div>
            <div className={`font-semibold text-lg ${isOverBudget ? 'text-destructive' : 'text-green-600'}`}>
              €{Math.abs(remainingBudget).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{spentPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all ${
                isOverBudget ? 'bg-destructive' : 'bg-primary'
              }`}
              style={{ width: `${Math.min(spentPercentage, 100)}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
            <span className="text-muted-foreground">Materials</span>
            <span className="font-medium">€{materialCost.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
            <span className="text-muted-foreground">Labour</span>
            <span className="font-medium">€{labourCost.toLocaleString()}</span>
          </div>
        </div>

        {isOverBudget && (
          <div className="flex items-center gap-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-destructive text-xs">
            <TrendingDown className="h-3 w-3" />
            <span>Over budget by €{Math.abs(remainingBudget).toLocaleString()}</span>
          </div>
        )}

        <EditPhaseBudgetDialog phase={phase}>
          <Button variant="outline" size="sm" className="w-full">
            Edit Budget
          </Button>
        </EditPhaseBudgetDialog>
      </CardContent>
    </Card>
  );
}
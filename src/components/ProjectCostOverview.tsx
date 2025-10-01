import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Euro, Package, Users, TrendingUp, AlertTriangle, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface ProjectCostOverviewProps {
  projectId: string;
}

interface ProjectCostSummary {
  totalMaterialCosts: number;
  totalLabourCosts: number;
  totalCosts: number;
  budget: number;
  remainingBudget: number;
  phaseBreakdown: {
    phaseId: string;
    phaseName: string;
    materialCost: number;
    labourCost: number;
    budget: number;
  }[];
}

export function ProjectCostOverview({ projectId }: ProjectCostOverviewProps) {
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null);
  
  const { data: costSummary, isLoading } = useQuery({
    queryKey: ['project-cost-summary', projectId],
    queryFn: async (): Promise<ProjectCostSummary> => {
      // Fetch project budget
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('budget, remaining_budget')
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;

      // Fetch phases with their costs
      const { data: phases, error: phasesError } = await supabase
        .from('project_phases')
        .select(`
          id,
          name,
          budget,
          material_cost,
          labour_cost
        `)
        .eq('project_id', projectId);

      if (phasesError) throw phasesError;

      // Calculate totals
      const totalMaterialCosts = phases?.reduce((sum, phase) => sum + (phase.material_cost || 0), 0) || 0;
      const totalLabourCosts = phases?.reduce((sum, phase) => sum + (phase.labour_cost || 0), 0) || 0;
      const totalCosts = totalMaterialCosts + totalLabourCosts;

      const phaseBreakdown = phases?.map(phase => ({
        phaseId: phase.id,
        phaseName: phase.name,
        materialCost: phase.material_cost || 0,
        labourCost: phase.labour_cost || 0,
        budget: phase.budget || 0,
      })) || [];

      return {
        totalMaterialCosts,
        totalLabourCosts,
        totalCosts,
        budget: project.budget || 0,
        remainingBudget: project.remaining_budget || 0,
        phaseBreakdown,
      };
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!costSummary) return null;

  const budgetUsagePercentage = costSummary.budget > 0 
    ? (costSummary.totalCosts / costSummary.budget) * 100 
    : 0;

  const isOverBudget = costSummary.totalCosts > costSummary.budget;

  return (
    <div className="space-y-6">
      {/* Cost Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Package className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Material Costs</div>
                <div className="text-lg font-semibold">€{costSummary.totalMaterialCosts.toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <Users className="h-4 w-4 text-success" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Labour Costs</div>
                <div className="text-lg font-semibold">€{costSummary.totalLabourCosts.toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Euro className="h-4 w-4 text-warning" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Costs</div>
                <div className="text-lg font-semibold">€{costSummary.totalCosts.toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                isOverBudget ? 'bg-destructive/10' : 'bg-accent/10'
              }`}>
                {isOverBudget ? (
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-accent-foreground" />
                )}
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Remaining Budget</div>
                <div className={`text-lg font-semibold ${
                  isOverBudget ? 'text-destructive' : ''
                }`}>
                  €{costSummary.remainingBudget.toLocaleString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Euro className="h-5 w-5" />
            Budget vs. Actual Spending
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>Budget Usage</span>
              <span className={isOverBudget ? 'text-destructive font-medium' : ''}>
                €{costSummary.totalCosts.toLocaleString()} / €{costSummary.budget.toLocaleString()}
              </span>
            </div>
            <Progress 
              value={budgetUsagePercentage} 
              className={`h-3 ${isOverBudget ? '[&>div]:bg-destructive' : ''}`}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span className={isOverBudget ? 'text-destructive font-medium' : ''}>
                {budgetUsagePercentage.toFixed(1)}%
              </span>
              <span>100%</span>
            </div>
            {isOverBudget && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <span>Project is over budget by €{(costSummary.totalCosts - costSummary.budget).toLocaleString()}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Phase Breakdown Dropdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Cost Breakdown by Phase</span>
            {costSummary.phaseBreakdown.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    {selectedPhaseId 
                      ? costSummary.phaseBreakdown.find(p => p.phaseId === selectedPhaseId)?.phaseName || 'Select Phase'
                      : `Select Phase (${costSummary.phaseBreakdown.length})`
                    }
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[300px] bg-background">
                  {costSummary.phaseBreakdown.map((phase) => {
                    const phaseTotal = phase.materialCost + phase.labourCost;
                    const phasePercentage = costSummary.totalCosts > 0 
                      ? (phaseTotal / costSummary.totalCosts) * 100 
                      : 0;
                    
                    return (
                      <DropdownMenuItem
                        key={phase.phaseId}
                        onClick={() => setSelectedPhaseId(phase.phaseId)}
                        className="flex items-center justify-between cursor-pointer"
                      >
                        <span className="font-medium">{phase.phaseName}</span>
                        <span className="text-xs text-muted-foreground">
                          €{phaseTotal.toLocaleString()} ({phasePercentage.toFixed(1)}%)
                        </span>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {costSummary.phaseBreakdown.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Euro className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No cost data available for project phases yet.</p>
            </div>
          ) : selectedPhaseId ? (
            (() => {
              const phase = costSummary.phaseBreakdown.find(p => p.phaseId === selectedPhaseId);
              if (!phase) return null;
              
              const phaseTotal = phase.materialCost + phase.labourCost;
              const phasePercentage = costSummary.totalCosts > 0 
                ? (phaseTotal / costSummary.totalCosts) * 100 
                : 0;
              const phaseBudgetUsage = phase.budget > 0
                ? (phaseTotal / phase.budget) * 100
                : 0;
              const isPhaseOverBudget = phaseTotal > phase.budget;

              return (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">{phase.phaseName}</span>
                    <span className="text-sm text-muted-foreground">
                      €{phaseTotal.toLocaleString()} of €{phase.budget.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Package className="h-4 w-4 text-primary" />
                          <span className="text-xs text-muted-foreground">Materials</span>
                        </div>
                        <div className="text-xl font-semibold">€{phase.materialCost.toLocaleString()}</div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="h-4 w-4 text-success" />
                          <span className="text-xs text-muted-foreground">Labour</span>
                        </div>
                        <div className="text-xl font-semibold">€{phase.labourCost.toLocaleString()}</div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Phase Budget Usage</span>
                      <span className={isPhaseOverBudget ? 'text-destructive font-medium' : ''}>
                        {phaseBudgetUsage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={phaseBudgetUsage} 
                      className={`h-3 ${isPhaseOverBudget ? '[&>div]:bg-destructive' : ''}`}
                    />
                    {isPhaseOverBudget && (
                      <div className="flex items-center gap-2 text-sm text-destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Over budget by €{(phaseTotal - phase.budget).toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>% of Total Project Cost</span>
                      <span className="font-medium">{phasePercentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={phasePercentage} className="h-2 mt-2" />
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Euro className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Select a phase from the dropdown to view detailed cost breakdown</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
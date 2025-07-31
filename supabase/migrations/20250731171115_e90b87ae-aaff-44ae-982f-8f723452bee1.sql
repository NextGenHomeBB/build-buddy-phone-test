-- Fix the budget distribution with a simpler approach
-- Set reasonable default budgets for phases that currently have budget = 0

-- Update phases with zero budget to have a portion of the project budget
WITH project_phase_counts AS (
  SELECT 
    project_id,
    budget as project_budget,
    COUNT(*) as phase_count
  FROM projects p
  JOIN project_phases pp ON pp.project_id = p.id
  WHERE p.budget > 0
  GROUP BY project_id, budget
)
UPDATE project_phases 
SET budget = ppc.project_budget / ppc.phase_count,
    updated_at = now()
FROM project_phase_counts ppc
WHERE project_phases.project_id = ppc.project_id 
AND project_phases.budget = 0;

-- Update the trigger function to better handle budget updates
CREATE OR REPLACE FUNCTION public.update_project_budget_on_phase_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  old_total DECIMAL DEFAULT 0;
  new_total DECIMAL DEFAULT 0;
  cost_delta DECIMAL DEFAULT 0;
BEGIN
  -- Calculate old total cost
  IF TG_OP = 'UPDATE' THEN
    old_total := COALESCE(OLD.material_cost, 0) + COALESCE(OLD.labour_cost, 0);
  END IF;
  
  -- Calculate new total cost  
  new_total := COALESCE(NEW.material_cost, 0) + COALESCE(NEW.labour_cost, 0);
  
  -- Calculate delta
  cost_delta := new_total - old_total;
  
  -- Update project's spent amount
  UPDATE projects 
  SET spent = spent + cost_delta,
      updated_at = now()
  WHERE id = NEW.project_id;
  
  RETURN NEW;
END;
$$;
-- Fix budget allocation and calculations

-- First, properly distribute project budgets across their phases
UPDATE project_phases 
SET budget = CASE 
  WHEN (SELECT COUNT(*) FROM project_phases pp2 WHERE pp2.project_id = project_phases.project_id) > 0 
  THEN (SELECT p.budget FROM projects p WHERE p.id = project_phases.project_id) / 
       (SELECT COUNT(*) FROM project_phases pp3 WHERE pp3.project_id = project_phases.project_id)
  ELSE 0
END,
updated_at = now()
WHERE budget = 0;

-- Fix project remaining_budget calculation - it should be budget minus total phase costs
UPDATE projects 
SET remaining_budget = budget - COALESCE((
  SELECT SUM(COALESCE(material_cost, 0) + COALESCE(labour_cost, 0)) 
  FROM project_phases 
  WHERE project_id = projects.id
), 0),
spent = COALESCE((
  SELECT SUM(COALESCE(material_cost, 0) + COALESCE(labour_cost, 0)) 
  FROM project_phases 
  WHERE project_id = projects.id
), 0),
updated_at = now();

-- Create or replace the trigger function to properly update project budget when phase costs change
CREATE OR REPLACE FUNCTION public.update_project_budget_on_phase_change()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  total_phase_costs DECIMAL DEFAULT 0;
  project_budget DECIMAL DEFAULT 0;
BEGIN
  -- Get the project budget and total phase costs
  SELECT 
    p.budget,
    COALESCE(SUM(pp.material_cost + pp.labour_cost), 0)
  INTO project_budget, total_phase_costs
  FROM projects p
  LEFT JOIN project_phases pp ON pp.project_id = p.id
  WHERE p.id = NEW.project_id
  GROUP BY p.budget;
  
  -- Update the project's spent and remaining_budget
  UPDATE projects 
  SET 
    spent = total_phase_costs,
    remaining_budget = project_budget - total_phase_costs,
    updated_at = now()
  WHERE id = NEW.project_id;
  
  RETURN NEW;
END;
$function$;

-- Ensure the trigger exists and is properly configured
DROP TRIGGER IF EXISTS update_project_budget_trigger ON project_phases;
CREATE TRIGGER update_project_budget_trigger
  AFTER INSERT OR UPDATE OR DELETE ON project_phases
  FOR EACH ROW
  EXECUTE FUNCTION update_project_budget_on_phase_change();
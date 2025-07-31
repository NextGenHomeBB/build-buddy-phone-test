-- Update phases that have zero budget to have a reasonable default based on project budget
-- This will fix the "$0 / $0" display issue

-- First, let's update phases that have no budget set (budget = 0) 
-- by distributing the project budget evenly among phases
UPDATE project_phases 
SET budget = CASE 
  WHEN (SELECT COUNT(*) FROM project_phases pp2 WHERE pp2.project_id = project_phases.project_id) > 0
  THEN (SELECT p.budget / GREATEST(COUNT(pp.id), 1) 
        FROM projects p 
        JOIN project_phases pp ON pp.project_id = p.id 
        WHERE p.id = project_phases.project_id)
  ELSE 0
END,
updated_at = now()
WHERE budget = 0 
AND EXISTS (
  SELECT 1 FROM projects p 
  WHERE p.id = project_phases.project_id 
  AND p.budget > 0
);

-- Update the trigger function to calculate budget correctly from material + labour costs
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
  
  -- Update project's spent amount (assuming this reflects total phase costs)
  UPDATE projects 
  SET spent = spent + cost_delta,
      updated_at = now()
  WHERE id = NEW.project_id;
  
  RETURN NEW;
END;
$$;
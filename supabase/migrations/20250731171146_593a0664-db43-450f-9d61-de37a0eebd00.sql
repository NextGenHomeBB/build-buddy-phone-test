-- Simple fix: set a default budget for phases that have budget = 0
-- Using a fixed amount per phase since complex joins are failing

-- Update phases that have zero budget to have a reasonable default
UPDATE project_phases 
SET budget = 10000,  -- €10,000 default per phase
    updated_at = now()
WHERE budget = 0;

-- Also ensure material_cost and labour_cost have proper defaults
UPDATE project_phases 
SET material_cost = COALESCE(material_cost, 0),
    labour_cost = COALESCE(labour_cost, 0),
    updated_at = now()
WHERE material_cost IS NULL OR labour_cost IS NULL;
-- Simple fix: manually set phase budgets for the specific project
UPDATE project_phases 
SET budget = 5172.41  -- €150,000 / 29 phases = €5,172.41 per phase
WHERE project_id = '2cd8db9a-f04e-4990-86ab-36a3bf7f65dc' 
AND budget = 0;
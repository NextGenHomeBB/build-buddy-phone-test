-- Create function to update phase costs when material costs change
CREATE OR REPLACE FUNCTION update_phase_material_costs()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the material_cost in project_phases by summing all material costs for this phase
  UPDATE project_phases 
  SET material_cost = (
    SELECT COALESCE(SUM(total), 0) 
    FROM material_costs 
    WHERE phase_id = COALESCE(NEW.phase_id, OLD.phase_id)
  ),
  updated_at = now()
  WHERE id = COALESCE(NEW.phase_id, OLD.phase_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create function to update phase costs when labour costs change
CREATE OR REPLACE FUNCTION update_phase_labour_costs()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the labour_cost in project_phases by summing all labour costs for this phase
  UPDATE project_phases 
  SET labour_cost = (
    SELECT COALESCE(SUM(total), 0) 
    FROM labour_costs 
    WHERE phase_id = COALESCE(NEW.phase_id, OLD.phase_id)
  ),
  updated_at = now()
  WHERE id = COALESCE(NEW.phase_id, OLD.phase_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for material_costs table
CREATE TRIGGER trigger_update_phase_material_costs_on_insert
  AFTER INSERT ON material_costs
  FOR EACH ROW
  EXECUTE FUNCTION update_phase_material_costs();

CREATE TRIGGER trigger_update_phase_material_costs_on_update
  AFTER UPDATE ON material_costs
  FOR EACH ROW
  EXECUTE FUNCTION update_phase_material_costs();

CREATE TRIGGER trigger_update_phase_material_costs_on_delete
  AFTER DELETE ON material_costs
  FOR EACH ROW
  EXECUTE FUNCTION update_phase_material_costs();

-- Create triggers for labour_costs table
CREATE TRIGGER trigger_update_phase_labour_costs_on_insert
  AFTER INSERT ON labour_costs
  FOR EACH ROW
  EXECUTE FUNCTION update_phase_labour_costs();

CREATE TRIGGER trigger_update_phase_labour_costs_on_update
  AFTER UPDATE ON labour_costs
  FOR EACH ROW
  EXECUTE FUNCTION update_phase_labour_costs();

CREATE TRIGGER trigger_update_phase_labour_costs_on_delete
  AFTER DELETE ON labour_costs
  FOR EACH ROW
  EXECUTE FUNCTION update_phase_labour_costs();

-- One-time update to recalculate all existing phase costs
UPDATE project_phases 
SET 
  material_cost = (
    SELECT COALESCE(SUM(total), 0) 
    FROM material_costs 
    WHERE phase_id = project_phases.id
  ),
  labour_cost = (
    SELECT COALESCE(SUM(total), 0) 
    FROM labour_costs 
    WHERE phase_id = project_phases.id
  ),
  updated_at = now();
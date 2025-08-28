-- Add GPS and photo verification to timesheets
ALTER TABLE public.timesheets 
ADD COLUMN start_location JSONB,
ADD COLUMN end_location JSONB,
ADD COLUMN start_photo_url TEXT,
ADD COLUMN end_photo_url TEXT,
ADD COLUMN location_verified BOOLEAN DEFAULT false;

-- Enhance timesheet_breaks with location tracking
ALTER TABLE public.timesheet_breaks
ADD COLUMN location JSONB,
ADD COLUMN break_reason TEXT;

-- Create location validation function
CREATE OR REPLACE FUNCTION public.validate_shift_location(
  timesheet_id_param UUID,
  current_location JSONB,
  project_location JSONB DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  distance_km NUMERIC;
  max_distance_km NUMERIC := 0.5; -- 500 meters tolerance
BEGIN
  -- If no project location provided, skip validation
  IF project_location IS NULL THEN
    RETURN true;
  END IF;
  
  -- Calculate distance using Haversine formula (simplified)
  -- This is a basic implementation - in production, use PostGIS
  distance_km := (
    SELECT 
      6371 * acos(
        cos(radians((project_location->>'lat')::NUMERIC)) * 
        cos(radians((current_location->>'lat')::NUMERIC)) * 
        cos(radians((current_location->>'lng')::NUMERIC) - radians((project_location->>'lng')::NUMERIC)) + 
        sin(radians((project_location->>'lat')::NUMERIC)) * 
        sin(radians((current_location->>'lat')::NUMERIC))
      )
  );
  
  -- Update verification status
  UPDATE public.timesheets 
  SET location_verified = (distance_km <= max_distance_km)
  WHERE id = timesheet_id_param;
  
  RETURN distance_km <= max_distance_km;
END;
$$;

-- Create trigger to validate location on timesheet updates
CREATE OR REPLACE FUNCTION public.trigger_validate_location()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only validate if we have location data and project_id
  IF NEW.start_location IS NOT NULL AND NEW.project_id IS NOT NULL THEN
    -- Get project location from projects table
    PERFORM validate_shift_location(
      NEW.id,
      NEW.start_location,
      (SELECT location FROM projects WHERE id = NEW.project_id LIMIT 1)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Add trigger for location validation
DROP TRIGGER IF EXISTS validate_location_trigger ON public.timesheets;
CREATE TRIGGER validate_location_trigger
  AFTER INSERT OR UPDATE ON public.timesheets
  FOR EACH ROW
  EXECUTE FUNCTION trigger_validate_location();
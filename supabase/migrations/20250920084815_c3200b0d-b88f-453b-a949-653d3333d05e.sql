-- Add a trigger to sync approved time off requests to absences table
CREATE OR REPLACE FUNCTION public.sync_approved_time_off_to_absences()
RETURNS TRIGGER AS $$
BEGIN
  -- Only sync when a request is approved
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    -- Delete any existing absence record for this date range to avoid duplicates
    DELETE FROM public.absences 
    WHERE user_id = NEW.user_id 
    AND work_date BETWEEN NEW.start_date AND NEW.end_date;
    
    -- Create absence records for each day in the approved time off period
    INSERT INTO public.absences (user_id, work_date, reason, approved_by, approved_at, request_type)
    SELECT 
      NEW.user_id,
      generate_series(NEW.start_date::date, NEW.end_date::date, '1 day'::interval)::date as work_date,
      COALESCE(NEW.reason, 'Time off: ' || NEW.request_type),
      NEW.approved_by,
      NEW.approved_at,
      NEW.request_type
    ON CONFLICT (user_id, work_date) DO UPDATE SET
      reason = EXCLUDED.reason,
      approved_by = EXCLUDED.approved_by,
      approved_at = EXCLUDED.approved_at,
      request_type = EXCLUDED.request_type;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS sync_approved_time_off ON public.time_off_requests;
CREATE TRIGGER sync_approved_time_off
  AFTER UPDATE ON public.time_off_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_approved_time_off_to_absences();

-- Enable realtime for availability tables
ALTER TABLE public.availability_overrides REPLICA IDENTITY FULL;
ALTER TABLE public.time_off_requests REPLICA IDENTITY FULL;
ALTER TABLE public.absences REPLICA IDENTITY FULL;

-- Add these tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.availability_overrides;
ALTER PUBLICATION supabase_realtime ADD TABLE public.time_off_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.absences;
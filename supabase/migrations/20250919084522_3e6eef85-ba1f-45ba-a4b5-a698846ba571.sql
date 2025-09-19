-- Enhanced absences table with approval workflow
ALTER TABLE public.absences 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
ADD COLUMN IF NOT EXISTS request_type text DEFAULT 'absence' CHECK (request_type IN ('vacation', 'sick_leave', 'personal', 'absence')),
ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES public.profiles(user_id),
ADD COLUMN IF NOT EXISTS approved_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Worker availability patterns (recurring schedule)
CREATE TABLE IF NOT EXISTS public.worker_availability (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_available boolean NOT NULL DEFAULT true,
  effective_from date NOT NULL DEFAULT CURRENT_DATE,
  effective_until date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, day_of_week, effective_from)
);

-- Time off requests (formal vacation/sick leave system)
CREATE TABLE IF NOT EXISTS public.time_off_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  request_type text NOT NULL CHECK (request_type IN ('vacation', 'sick_leave', 'personal', 'unpaid')),
  reason text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'cancelled')),
  days_requested numeric NOT NULL DEFAULT 1,
  approved_by uuid REFERENCES public.profiles(user_id),
  approved_at timestamp with time zone,
  admin_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Availability overrides (temporary changes)
CREATE TABLE IF NOT EXISTS public.availability_overrides (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  override_date date NOT NULL,
  start_time time,
  end_time time,
  is_available boolean NOT NULL DEFAULT false,
  reason text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, override_date)
);

-- Enable RLS on new tables
ALTER TABLE public.worker_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_off_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_overrides ENABLE ROW LEVEL SECURITY;

-- RLS Policies for worker_availability
CREATE POLICY "Users can manage their own availability" ON public.worker_availability
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Managers can view all availability" ON public.worker_availability
  FOR SELECT USING (get_current_user_role_from_jwt() = ANY(ARRAY['manager', 'admin']));

-- RLS Policies for time_off_requests  
CREATE POLICY "Users can manage their own time off requests" ON public.time_off_requests
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Managers can view and approve all time off requests" ON public.time_off_requests
  FOR ALL USING (get_current_user_role_from_jwt() = ANY(ARRAY['manager', 'admin']));

-- RLS Policies for availability_overrides
CREATE POLICY "Users can manage their own availability overrides" ON public.availability_overrides
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Managers can view all availability overrides" ON public.availability_overrides
  FOR SELECT USING (get_current_user_role_from_jwt() = ANY(ARRAY['manager', 'admin']));

-- Update triggers for timestamps
CREATE OR REPLACE FUNCTION public.update_availability_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_worker_availability_updated_at
  BEFORE UPDATE ON public.worker_availability
  FOR EACH ROW EXECUTE FUNCTION public.update_availability_updated_at();

CREATE TRIGGER update_time_off_requests_updated_at
  BEFORE UPDATE ON public.time_off_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_availability_updated_at();

CREATE TRIGGER update_availability_overrides_updated_at
  BEFORE UPDATE ON public.availability_overrides
  FOR EACH ROW EXECUTE FUNCTION public.update_availability_updated_at();

-- Function to check worker availability for a specific date and time
CREATE OR REPLACE FUNCTION public.check_worker_availability(
  worker_id uuid,
  check_date date,
  start_time time DEFAULT NULL,
  end_time time DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  day_of_week integer;
  is_available boolean := false;
BEGIN
  -- Get day of week (0 = Sunday)
  day_of_week := EXTRACT(dow FROM check_date);
  
  -- Check for time off requests first (highest priority)
  IF EXISTS (
    SELECT 1 FROM public.time_off_requests
    WHERE user_id = worker_id
    AND status = 'approved'
    AND check_date >= start_date
    AND check_date <= end_date
  ) THEN
    RETURN false;
  END IF;
  
  -- Check for availability overrides
  SELECT COALESCE(ao.is_available, false) INTO is_available
  FROM public.availability_overrides ao
  WHERE ao.user_id = worker_id
  AND ao.override_date = check_date
  AND (start_time IS NULL OR end_time IS NULL OR 
       (ao.start_time <= start_time AND ao.end_time >= end_time));
  
  IF FOUND THEN
    RETURN is_available;
  END IF;
  
  -- Check regular availability pattern
  SELECT wa.is_available INTO is_available
  FROM public.worker_availability wa
  WHERE wa.user_id = worker_id
  AND wa.day_of_week = day_of_week
  AND wa.effective_from <= check_date
  AND (wa.effective_until IS NULL OR wa.effective_until >= check_date)
  AND (start_time IS NULL OR end_time IS NULL OR 
       (wa.start_time <= start_time AND wa.end_time >= end_time))
  ORDER BY wa.effective_from DESC
  LIMIT 1;
  
  RETURN COALESCE(is_available, true); -- Default to available if no pattern set
END;
$$;
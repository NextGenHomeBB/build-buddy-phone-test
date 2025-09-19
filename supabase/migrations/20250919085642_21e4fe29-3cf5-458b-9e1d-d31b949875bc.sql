-- Enhanced absences table with approval workflow (add columns if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'absences' AND column_name = 'status') THEN
    ALTER TABLE public.absences ADD COLUMN status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'absences' AND column_name = 'request_type') THEN
    ALTER TABLE public.absences ADD COLUMN request_type text DEFAULT 'absence' CHECK (request_type IN ('vacation', 'sick_leave', 'personal', 'absence'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'absences' AND column_name = 'approved_by') THEN
    ALTER TABLE public.absences ADD COLUMN approved_by uuid REFERENCES public.profiles(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'absences' AND column_name = 'approved_at') THEN
    ALTER TABLE public.absences ADD COLUMN approved_at timestamp with time zone;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'absences' AND column_name = 'notes') THEN
    ALTER TABLE public.absences ADD COLUMN notes text;
  END IF;
END $$;

-- Worker availability patterns (recurring schedule)
CREATE TABLE IF NOT EXISTS public.worker_availability (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
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

-- Create policies only if they don't exist
DO $$
BEGIN
  -- Worker availability policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'worker_availability' AND policyname = 'Users can manage their own availability') THEN
    CREATE POLICY "Users can manage their own availability" ON public.worker_availability
      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'worker_availability' AND policyname = 'Managers can view all availability') THEN
    CREATE POLICY "Managers can view all availability" ON public.worker_availability
      FOR SELECT USING (get_current_user_role_from_jwt() = ANY(ARRAY['manager', 'admin']));
  END IF;

  -- Time off requests policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'time_off_requests' AND policyname = 'Users can manage their own time off requests') THEN
    CREATE POLICY "Users can manage their own time off requests" ON public.time_off_requests
      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'time_off_requests' AND policyname = 'Managers can view and approve all time off requests') THEN
    CREATE POLICY "Managers can view and approve all time off requests" ON public.time_off_requests
      FOR ALL USING (get_current_user_role_from_jwt() = ANY(ARRAY['manager', 'admin']));
  END IF;

  -- Availability overrides policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'availability_overrides' AND policyname = 'Users can manage their own availability overrides') THEN
    CREATE POLICY "Users can manage their own availability overrides" ON public.availability_overrides
      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'availability_overrides' AND policyname = 'Managers can view all availability overrides') THEN
    CREATE POLICY "Managers can view all availability overrides" ON public.availability_overrides
      FOR SELECT USING (get_current_user_role_from_jwt() = ANY(ARRAY['manager', 'admin']));
  END IF;
END $$;
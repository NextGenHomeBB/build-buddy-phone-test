-- Create worker rates table with rate history
CREATE TABLE public.worker_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  hourly_rate NUMERIC NOT NULL DEFAULT 25.00,
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payroll periods table
CREATE TABLE public.payroll_periods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payroll entries table
CREATE TABLE public.payroll_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  payroll_period_id UUID NOT NULL,
  user_id UUID NOT NULL,
  regular_hours NUMERIC NOT NULL DEFAULT 0,
  overtime_hours NUMERIC NOT NULL DEFAULT 0,
  regular_rate NUMERIC NOT NULL DEFAULT 0,
  overtime_rate NUMERIC NOT NULL DEFAULT 0,
  gross_pay NUMERIC NOT NULL DEFAULT 0,
  deductions NUMERIC NOT NULL DEFAULT 0,
  net_pay NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  paid_date DATE,
  payment_method TEXT DEFAULT 'bank_transfer',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create worker skills table
CREATE TABLE public.worker_skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  skill_name TEXT NOT NULL,
  skill_level INTEGER NOT NULL DEFAULT 1 CHECK (skill_level >= 1 AND skill_level <= 5),
  certified BOOLEAN DEFAULT false,
  certification_date DATE,
  certification_expiry DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.worker_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_skills ENABLE ROW LEVEL SECURITY;

-- RLS Policies for worker_rates
CREATE POLICY "Admin and managers can manage worker rates" ON public.worker_rates
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'manager')
  )
);

CREATE POLICY "Workers can view their own rates" ON public.worker_rates
FOR SELECT USING (user_id = auth.uid());

-- RLS Policies for payroll_periods
CREATE POLICY "Admin and managers can manage payroll periods" ON public.payroll_periods
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'manager')
  )
);

-- RLS Policies for payroll_entries
CREATE POLICY "Admin and managers can manage payroll entries" ON public.payroll_entries
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'manager')
  )
);

CREATE POLICY "Workers can view their own payroll entries" ON public.payroll_entries
FOR SELECT USING (user_id = auth.uid());

-- RLS Policies for worker_skills
CREATE POLICY "Admin and managers can manage worker skills" ON public.worker_skills
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'manager')
  )
);

CREATE POLICY "Workers can view and update their own skills" ON public.worker_skills
FOR ALL USING (user_id = auth.uid());

-- Add triggers for updated_at
CREATE TRIGGER update_worker_rates_updated_at
  BEFORE UPDATE ON public.worker_rates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payroll_periods_updated_at
  BEFORE UPDATE ON public.payroll_periods
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payroll_entries_updated_at
  BEFORE UPDATE ON public.payroll_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_worker_skills_updated_at
  BEFORE UPDATE ON public.worker_skills
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default rates for existing workers
INSERT INTO public.worker_rates (user_id, hourly_rate, notes)
SELECT 
  user_id, 
  CASE 
    WHEN role = 'admin' THEN 75.00
    WHEN role = 'manager' THEN 65.00
    ELSE 45.00
  END as hourly_rate,
  'Initial rate setup'
FROM public.profiles 
WHERE is_placeholder = false
ON CONFLICT DO NOTHING;
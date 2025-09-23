-- Create worker invoices table
CREATE TABLE public.worker_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  worker_id UUID NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_hours DECIMAL(10,2),
  hourly_rate DECIMAL(10,2),
  subtotal DECIMAL(10,2),
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'draft',
  issued_date DATE,
  due_date DATE,
  paid_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create worker invoice items table
CREATE TABLE public.worker_invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES public.worker_invoices(id) ON DELETE CASCADE,
  project_id UUID,
  phase_id UUID,
  description TEXT,
  hours DECIMAL(10,2),
  rate DECIMAL(10,2),
  amount DECIMAL(10,2),
  work_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project invoices table
CREATE TABLE public.project_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  project_id UUID NOT NULL,
  client_name VARCHAR(255),
  client_email VARCHAR(255),
  client_address TEXT,
  billing_type VARCHAR(20) DEFAULT 'completion',
  total_amount DECIMAL(12,2),
  tax_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  net_amount DECIMAL(12,2),
  status VARCHAR(20) DEFAULT 'draft',
  issued_date DATE,
  due_date DATE,
  paid_date DATE,
  payment_terms VARCHAR(50) DEFAULT 'Net 30',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project invoice items table
CREATE TABLE public.project_invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES public.project_invoices(id) ON DELETE CASCADE,
  phase_id UUID,
  item_type VARCHAR(20) DEFAULT 'labor',
  description TEXT,
  quantity DECIMAL(10,2),
  unit_price DECIMAL(10,2),
  total DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all invoice tables
ALTER TABLE public.worker_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_invoice_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for worker invoices
CREATE POLICY "Admin and managers can manage worker invoices"
ON public.worker_invoices
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'manager')
  )
);

CREATE POLICY "Workers can view their own invoices"
ON public.worker_invoices
FOR SELECT
USING (worker_id = auth.uid());

-- RLS policies for worker invoice items
CREATE POLICY "Admin and managers can manage worker invoice items"
ON public.worker_invoice_items
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'manager')
  )
);

CREATE POLICY "Workers can view their own invoice items"
ON public.worker_invoice_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.worker_invoices wi
    WHERE wi.id = worker_invoice_items.invoice_id
    AND wi.worker_id = auth.uid()
  )
);

-- RLS policies for project invoices
CREATE POLICY "Admin and managers can manage project invoices"
ON public.project_invoices
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'manager')
  )
);

-- RLS policies for project invoice items
CREATE POLICY "Admin and managers can manage project invoice items"
ON public.project_invoice_items
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'manager')
  )
);

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_worker_invoices_updated_at BEFORE UPDATE
ON public.worker_invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_invoices_updated_at BEFORE UPDATE
ON public.project_invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
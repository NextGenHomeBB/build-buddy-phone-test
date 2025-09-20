-- Add approval workflow fields to availability_overrides table
ALTER TABLE public.availability_overrides 
ADD COLUMN status TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN approved_by UUID,
ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN admin_notes TEXT;

-- Add check constraint for status values
ALTER TABLE public.availability_overrides 
ADD CONSTRAINT availability_overrides_status_check 
CHECK (status IN ('pending', 'approved', 'denied'));

-- Update existing overrides to be approved (so they don't break)
UPDATE public.availability_overrides 
SET status = 'approved', approved_at = created_at 
WHERE status = 'pending';
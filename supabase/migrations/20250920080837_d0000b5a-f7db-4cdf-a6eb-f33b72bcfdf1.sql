-- Add specific INSERT policy for availability overrides
-- This ensures workers can create their own availability overrides
CREATE POLICY "Workers can create their own availability overrides"
ON public.availability_overrides
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
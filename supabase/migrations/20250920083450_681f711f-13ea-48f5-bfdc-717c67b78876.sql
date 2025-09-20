-- Add UPDATE policy for availability_overrides to allow managers/admins to approve/deny requests
CREATE POLICY "Managers and admins can update availability overrides"
ON public.availability_overrides
FOR UPDATE
USING (get_current_user_role_from_jwt() = ANY (ARRAY['manager'::text, 'admin'::text]));
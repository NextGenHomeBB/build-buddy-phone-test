-- Add DELETE policy for profiles table to allow admins to delete users
CREATE POLICY "Only admins can delete profiles" 
ON public.profiles 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'::user_role
  )
);

-- Add function to handle user deletion with cleanup
CREATE OR REPLACE FUNCTION public.delete_user_profile(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_role user_role;
BEGIN
  -- Check if current user is admin
  SELECT role INTO current_user_role
  FROM public.profiles 
  WHERE user_id = auth.uid();
  
  IF current_user_role != 'admin'::user_role THEN
    RAISE EXCEPTION 'Only admins can delete users';
  END IF;
  
  -- Delete the user profile (related records should cascade or be handled by foreign keys)
  DELETE FROM public.profiles 
  WHERE user_id = target_user_id;
  
  RETURN FOUND;
END;
$$;
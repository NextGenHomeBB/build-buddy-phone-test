-- Add foreign key constraint to link timesheets with profiles
ALTER TABLE timesheets 
ADD CONSTRAINT timesheets_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(user_id);
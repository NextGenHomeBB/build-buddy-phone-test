-- Update the delete_user_profile function to properly handle cascading deletions
CREATE OR REPLACE FUNCTION public.delete_user_profile(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_role user_role;
  records_deleted integer := 0;
BEGIN
  -- Check if current user is admin
  SELECT role INTO current_user_role
  FROM public.profiles 
  WHERE user_id = auth.uid();
  
  IF current_user_role != 'admin'::user_role THEN
    RAISE EXCEPTION 'Only admins can delete users';
  END IF;
  
  -- Start transaction for safe cleanup
  BEGIN
    -- 1. Delete timesheets for this user
    DELETE FROM public.timesheets WHERE user_id = target_user_id;
    
    -- 2. Delete timesheet breaks (via cascade from timesheets deletion above)
    -- This should already be handled by cascade, but let's be explicit
    DELETE FROM public.timesheet_breaks 
    WHERE timesheet_id IN (
      SELECT id FROM public.timesheets WHERE user_id = target_user_id
    );
    
    -- 3. Delete labour entries for this user
    DELETE FROM public.labour_entries WHERE user_id = target_user_id;
    
    -- 4. Delete user project roles
    DELETE FROM public.user_project_role WHERE user_id = target_user_id;
    
    -- 5. Delete schedule item workers
    DELETE FROM public.schedule_item_workers WHERE user_id = target_user_id;
    
    -- 6. Delete task workers
    DELETE FROM public.task_workers WHERE user_id = target_user_id;
    
    -- 7. Delete task comments by this user
    DELETE FROM public.task_comments WHERE user_id = target_user_id;
    
    -- 8. Delete checklist item assignments (set to null)
    UPDATE public.checklist_items SET assignee_id = NULL WHERE assignee_id = target_user_id;
    
    -- 9. Delete personal tasks and task lists for this user
    DELETE FROM public.personal_tasks WHERE user_id = target_user_id;
    DELETE FROM public.personal_task_lists WHERE user_id = target_user_id;
    
    -- 10. Delete user material favorites
    DELETE FROM public.user_material_favorites WHERE user_id = target_user_id;
    
    -- 11. Delete feedback submitted by this user
    DELETE FROM public.feedback WHERE user_id = target_user_id;
    
    -- 12. Delete absences for this user
    DELETE FROM public.absences WHERE user_id = target_user_id;
    
    -- 13. Delete user phase roles
    DELETE FROM public.user_phase_role WHERE user_id = target_user_id;
    
    -- 14. Update tasks to remove user references (preserve task history)
    UPDATE public.tasks SET assigned_to = NULL WHERE assigned_to = target_user_id;
    UPDATE public.tasks SET assigned_by = NULL WHERE assigned_by = target_user_id;
    UPDATE public.tasks SET approved_by = NULL WHERE approved_by = target_user_id;
    
    -- 15. Update projects to remove user references (preserve project history)
    UPDATE public.projects SET manager_id = NULL WHERE manager_id = target_user_id;
    UPDATE public.projects SET created_by = NULL WHERE created_by = target_user_id;
    
    -- 16. Update schedules created by this user
    UPDATE public.schedules SET created_by = NULL WHERE created_by = target_user_id;
    
    -- 17. Update project documents uploaded by this user
    UPDATE public.project_documents SET uploaded_by = NULL WHERE uploaded_by = target_user_id;
    
    -- 18. Finally, delete the user profile
    DELETE FROM public.profiles WHERE user_id = target_user_id;
    
    GET DIAGNOSTICS records_deleted = ROW_COUNT;
    
    IF records_deleted = 0 THEN
      RAISE EXCEPTION 'User profile not found or could not be deleted';
    END IF;
    
    RETURN true;
    
  EXCEPTION WHEN OTHERS THEN
    -- Re-raise the exception with more context
    RAISE EXCEPTION 'Failed to delete user profile: %', SQLERRM;
  END;
END;
$$;
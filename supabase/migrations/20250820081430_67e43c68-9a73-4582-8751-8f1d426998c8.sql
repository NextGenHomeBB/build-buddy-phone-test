-- Enable realtime for core sync tables
ALTER TABLE public.projects REPLICA IDENTITY FULL;
ALTER TABLE public.project_phases REPLICA IDENTITY FULL;
ALTER TABLE public.tasks REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.user_project_role REPLICA IDENTITY FULL;
ALTER TABLE public.timesheets REPLICA IDENTITY FULL;
ALTER TABLE public.labour_entries REPLICA IDENTITY FULL;
ALTER TABLE public.material_costs REPLICA IDENTITY FULL;
ALTER TABLE public.checklist_items REPLICA IDENTITY FULL;
ALTER TABLE public.task_comments REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_phases;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_project_role;
ALTER PUBLICATION supabase_realtime ADD TABLE public.timesheets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.labour_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.material_costs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.checklist_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.task_comments;
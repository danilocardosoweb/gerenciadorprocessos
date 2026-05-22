-- Fix tasks and task_comments foreign keys to reference tecno_users instead of users
-- This aligns the DB schema with the application code which uses tecno_users for authentication

-- 1. Drop existing foreign key constraints on tasks table
ALTER TABLE public.tasks 
  DROP CONSTRAINT IF EXISTS tasks_assigned_to_fkey,
  DROP CONSTRAINT IF EXISTS tasks_created_by_fkey;

-- 2. Drop existing foreign key constraint on task_comments table
ALTER TABLE public.task_comments 
  DROP CONSTRAINT IF EXISTS task_comments_user_id_fkey;

-- 3. Recreate foreign keys pointing to tecno_users
ALTER TABLE public.tasks 
  ADD CONSTRAINT tasks_assigned_to_fkey 
    FOREIGN KEY (assigned_to) REFERENCES public.tecno_users(id) ON DELETE SET NULL,
  ADD CONSTRAINT tasks_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES public.tecno_users(id) ON DELETE SET NULL;

ALTER TABLE public.task_comments 
  ADD CONSTRAINT task_comments_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.tecno_users(id) ON DELETE CASCADE;

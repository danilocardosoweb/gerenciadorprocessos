-- Fix ALL foreign key constraints that reference 'users' table to instead reference 'tecno_users'
-- This aligns the database schema with the application which authenticates against tecno_users

-- ============================================
-- 1. process_items table
-- ============================================
ALTER TABLE public.process_items
  DROP CONSTRAINT IF EXISTS process_items_created_by_fkey;

-- Add the column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'process_items' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE public.process_items ADD COLUMN created_by UUID;
  END IF;
END $$;

ALTER TABLE public.process_items
  ADD CONSTRAINT process_items_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES public.tecno_users(id) ON DELETE SET NULL;

-- ============================================
-- 2. tasks table
-- ============================================
ALTER TABLE public.tasks
  DROP CONSTRAINT IF EXISTS tasks_assigned_to_fkey,
  DROP CONSTRAINT IF EXISTS tasks_created_by_fkey;

ALTER TABLE public.tasks
  ADD CONSTRAINT tasks_assigned_to_fkey
    FOREIGN KEY (assigned_to) REFERENCES public.tecno_users(id) ON DELETE SET NULL,
  ADD CONSTRAINT tasks_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES public.tecno_users(id) ON DELETE SET NULL;

-- ============================================
-- 3. task_comments table
-- ============================================
ALTER TABLE public.task_comments
  DROP CONSTRAINT IF EXISTS task_comments_user_id_fkey;

ALTER TABLE public.task_comments
  ADD CONSTRAINT task_comments_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.tecno_users(id) ON DELETE CASCADE;

-- ============================================
-- 4. task_alerts table (if it exists)
-- ============================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'task_alerts'
  ) THEN
    ALTER TABLE public.task_alerts
      DROP CONSTRAINT IF EXISTS task_alerts_from_user_id_fkey,
      DROP CONSTRAINT IF EXISTS task_alerts_to_user_id_fkey;
    
    ALTER TABLE public.task_alerts
      ADD CONSTRAINT task_alerts_from_user_id_fkey
        FOREIGN KEY (from_user_id) REFERENCES public.tecno_users(id) ON DELETE CASCADE,
      ADD CONSTRAINT task_alerts_to_user_id_fkey
        FOREIGN KEY (to_user_id) REFERENCES public.tecno_users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ============================================
-- 5. documents table (if it has created_by)
-- ============================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'documents' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE public.documents
      DROP CONSTRAINT IF EXISTS documents_created_by_fkey;
    
    ALTER TABLE public.documents
      ADD CONSTRAINT documents_created_by_fkey
        FOREIGN KEY (created_by) REFERENCES public.tecno_users(id) ON DELETE SET NULL;
  END IF;
END $$;

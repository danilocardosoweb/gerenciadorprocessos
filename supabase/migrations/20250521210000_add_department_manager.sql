-- Add department manager fields to tecno_users
ALTER TABLE public.tecno_users 
ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_department_manager BOOLEAN DEFAULT FALSE;

-- Create index for department manager queries
CREATE INDEX IF NOT EXISTS idx_tecno_users_department_id ON public.tecno_users(department_id);
CREATE INDEX IF NOT EXISTS idx_tecno_users_is_department_manager ON public.tecno_users(is_department_manager);

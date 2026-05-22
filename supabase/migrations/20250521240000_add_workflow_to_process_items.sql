-- Add workflow status to process_items for approval flow
ALTER TABLE public.process_items
ADD COLUMN IF NOT EXISTS workflow_status TEXT DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS workflow_approver TEXT,
ADD COLUMN IF NOT EXISTS workflow_approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS workflow_comments TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS workflow_history JSONB DEFAULT '[]'::jsonb;

-- Create index for workflow status queries
CREATE INDEX IF NOT EXISTS idx_process_items_workflow_status ON public.process_items(workflow_status);

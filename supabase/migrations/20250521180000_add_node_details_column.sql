-- Add node_details column to process_items table
-- This column stores additional node data like tasks, guides, files, and images

ALTER TABLE public.process_items 
ADD COLUMN IF NOT EXISTS node_details JSONB DEFAULT '{}'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.process_items.node_details IS 
'Stores additional node-specific details including tasks, howTo guides, files, images, and other metadata per node';

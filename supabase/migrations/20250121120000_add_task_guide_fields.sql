-- Migration: Add support for task guide, files and images
-- This migration ensures the node_details JSON structure can store the new fields

-- The node_details column in process_items already supports JSONB
-- No structural changes needed - the new fields are stored within the JSON

-- However, if you want to add a specific index for querying tasks with guides:
CREATE INDEX IF NOT EXISTS idx_node_details_tasks_guide 
ON process_items USING GIN ((node_details->'tasks'));

-- Add comment explaining the new structure
COMMENT ON TABLE process_items IS 'Process items with node details including tasks with guides, files and images';

-- Example of the new JSON structure for node_details:
/*
{
  "description": "string",
  "images": ["url1", "url2"],
  "tasks": [
    {
      "id": "string",
      "text": "string",
      "completed": false,
      "howTo": [
        {
          "order": 1,
          "instruction": "string",
          "visualHint": "string"
        }
      ],
      "ifOK": {
        "result": "string",
        "action": "string",
        "nextStep": "string",
        "alertLevel": "success"
      },
      "ifNOK": {
        "result": "string",
        "action": "string",
        "nextStep": "string",
        "alertLevel": "critical"
      },
      "tips": [
        {
          "icon": "string",
          "message": "string"
        }
      ],
      "files": [
        {
          "id": "string",
          "name": "string",
          "url": "string",
          "type": "pdf|doc|xls|image|other"
        }
      ],
      "images": ["url1", "url2"]
    }
  ]
}
*/

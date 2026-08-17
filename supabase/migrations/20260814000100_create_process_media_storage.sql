-- Persistent visual references used by process maps.
-- Safe to run repeatedly.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'process-media',
  'process-media',
  true,
  12582912,
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/ogg']
)
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'process_media_select'
  ) THEN
    CREATE POLICY process_media_select
      ON storage.objects FOR SELECT TO public
      USING (bucket_id = 'process-media');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'process_media_insert'
  ) THEN
    CREATE POLICY process_media_insert
      ON storage.objects FOR INSERT TO public
      WITH CHECK (bucket_id = 'process-media');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'process_media_delete'
  ) THEN
    CREATE POLICY process_media_delete
      ON storage.objects FOR DELETE TO public
      USING (bucket_id = 'process-media');
  END IF;
END $$;

-- Suporte a upload/download real de arquivos na Central de Documentos
-- Seguro para executar mais de uma vez

ALTER TABLE IF EXISTS public.documents
  ADD COLUMN IF NOT EXISTS file_path TEXT,
  ADD COLUMN IF NOT EXISTS file_size_bytes BIGINT,
  ADD COLUMN IF NOT EXISTS mime_type TEXT;

CREATE INDEX IF NOT EXISTS idx_documents_file_path ON public.documents(file_path);

-- Bucket para arquivos de documentos
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Politicas de acesso ao bucket "documents"
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'documents_storage_select'
  ) THEN
    CREATE POLICY documents_storage_select
      ON storage.objects
      FOR SELECT
      TO public
      USING (bucket_id = 'documents');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'documents_storage_insert'
  ) THEN
    CREATE POLICY documents_storage_insert
      ON storage.objects
      FOR INSERT
      TO public
      WITH CHECK (bucket_id = 'documents');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'documents_storage_update'
  ) THEN
    CREATE POLICY documents_storage_update
      ON storage.objects
      FOR UPDATE
      TO public
      USING (bucket_id = 'documents')
      WITH CHECK (bucket_id = 'documents');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'documents_storage_delete'
  ) THEN
    CREATE POLICY documents_storage_delete
      ON storage.objects
      FOR DELETE
      TO public
      USING (bucket_id = 'documents');
  END IF;
END $$;

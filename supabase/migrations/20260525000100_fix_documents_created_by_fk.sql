-- Corrige definitivamente o vínculo de autoria dos documentos
-- Garante que documents.created_by aponte para tecno_users(id)

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'documents'
      AND column_name = 'created_by'
  ) THEN
    ALTER TABLE public.documents
      ALTER COLUMN created_by DROP NOT NULL;

    ALTER TABLE public.documents
      DROP CONSTRAINT IF EXISTS documents_created_by_fkey;

    ALTER TABLE public.documents
      ADD CONSTRAINT documents_created_by_fkey
      FOREIGN KEY (created_by)
      REFERENCES public.tecno_users(id)
      ON DELETE SET NULL;
  END IF;
END $$;

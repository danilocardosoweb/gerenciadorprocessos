-- Add password and status columns to users table
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS password TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Ativo',
  ADD COLUMN IF NOT EXISTS department TEXT;

-- Insert or upsert the existing mock users so they can login
INSERT INTO public.users (id, name, email, role, password, status)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Danilo Cardoso', 'pcp@tecnoperfilalumino.com.br', 'Administrador', 'admin123', 'Ativo'),
  ('00000000-0000-0000-0000-000000000002', 'João Silva', 'joao.silva@exemplo.com', 'Editor', '123456', 'Ativo'),
  ('00000000-0000-0000-0000-000000000003', 'Maria Souza', 'maria.souza@exemplo.com', 'Editor', '123456', 'Ativo')
ON CONFLICT (id) DO UPDATE SET
  password = EXCLUDED.password,
  status   = EXCLUDED.status;

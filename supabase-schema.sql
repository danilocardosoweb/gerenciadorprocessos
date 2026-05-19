-- Tabela de Configurações e Papéis
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    users_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Tabela de Usuários (App Users) do nosso sistema
CREATE TABLE app_users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role_id INTEGER REFERENCES roles(id),
    status TEXT CHECK (status IN ('Ativo', 'Inativo')) DEFAULT 'Ativo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Tabela de Documentos (Document Manager)
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    size TEXT,
    upload_date DATE DEFAULT CURRENT_DATE,
    expiration_date DATE,
    status TEXT CHECK (status IN ('valid', 'expiring', 'expired')) DEFAULT 'valid',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Tabela de Processos / Itens (Mapa, Pasta, Ideia/Kaizen, Setor 3D)
CREATE TABLE process_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    type TEXT CHECK (type IN ('map', 'folder', 'markdown', 'sector3d')) NOT NULL,
    parent_id UUID REFERENCES process_items(id) ON DELETE CASCADE,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Popular dados iniciais de exemplo de Roles
INSERT INTO roles (name, description, users_count) VALUES
('Administrador', 'Acesso total ao sistema, configurações e mapas.', 1),
('Editor', 'Pode criar e editar mapas e documentos, mas não gerencia usuários.', 5),
('Visualizador', 'Apenas visualiza mapas e documentos aprovados.', 12);

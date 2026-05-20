# Setup do Supabase

## Problema
O app está tentando acessar tabelas que não existem no banco de dados Supabase:
- `users`
- `tasks`
- `task_comments`
- `departments`
- `roles`

## Solução

### Opção 1: Via SQL Editor do Supabase (Recomendado)

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá para **SQL Editor** (no menu esquerdo)
4. Clique em **New Query**
5. Copie e cole o conteúdo do arquivo `supabase/migrations/create_tables.sql`
6. Clique em **Run**

### Opção 2: Via CLI do Supabase

```bash
# Instale a CLI se não tiver
npm install -g supabase

# Faça login
supabase login

# Execute a migração
supabase db push
```

## O que será criado

### Tabelas
- **roles**: Papéis de usuário (Administrador, Editor, Visualizador)
- **users**: Usuários do sistema
- **departments**: Departamentos (Produção, Qualidade, Logística, Manutenção)
- **tasks**: Tarefas e subtarefas
- **task_comments**: Comentários em tarefas

### Dados padrão
- 3 roles pré-configurados
- 4 departamentos padrão

## Após executar

1. Recarregue a página do app (Ctrl+F5)
2. Os erros de tabela não encontrada devem desaparecer
3. O sistema de tarefas e departamentos funcionará normalmente

## Troubleshooting

Se ainda houver erros:
1. Verifique se as variáveis de ambiente estão corretas:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

2. Verifique as permissões RLS (Row Level Security) no Supabase:
   - Vá para **Authentication** → **Policies**
   - Certifique-se de que as políticas permitem leitura/escrita

3. Verifique se o projeto Supabase está ativo (não pausado)

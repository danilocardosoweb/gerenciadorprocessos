# Guia de Configuração - Vercel + Supabase

## 📋 Pré-requisitos
- Conta no [Vercel](https://vercel.com)
- Repositório no GitHub: `https://github.com/danilocardosoweb/gerenciadorprocessos`
- Projeto Supabase: `Porta_Tecno_IA`

---

## 🚀 Passo 1: Deploy no Vercel

### 1.1 Conectar GitHub ao Vercel
1. Acesse [vercel.com/new](https://vercel.com/new)
2. Clique em **"Import Git Repository"**
3. Selecione sua conta GitHub
4. Procure por `gerenciadorprocessos`
5. Clique em **"Import"**

### 1.2 Configurar Projeto
- **Project Name**: `gerenciadorprocessos` (ou outro nome)
- **Framework Preset**: `Vite`
- **Root Directory**: `./` (raiz do projeto)

---

## 🔐 Passo 2: Adicionar Variáveis de Ambiente

### 2.1 No Vercel Dashboard
1. Vá para **Settings** → **Environment Variables**
2. Adicione as seguintes variáveis:

#### Variáveis Obrigatórias (Supabase)

```
VITE_SUPABASE_URL = https://zfeywfbfagjbarpcsskn.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmZXl3ZmJmYWdqYmFycGNzc2tuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE3NzE5NjAsImV4cCI6MjA0NzM0Nzk2MH0.YOUR_ANON_KEY_HERE
```

#### Variáveis Opcionais

```
VITE_GEMINI_API_KEY = sua_chave_gemini_aqui
VITE_APP_NAME = Tecno Mapper
VITE_APP_VERSION = 1.0.0
```

### 2.2 Onde Encontrar as Chaves Supabase

**VITE_SUPABASE_URL:**
1. Acesse [supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecione projeto `Porta_Tecno_IA`
3. Vá em **Settings** → **API**
4. Copie **Project URL**

**VITE_SUPABASE_ANON_KEY:**
1. Mesmo local acima
2. Copie **anon public** (chave pública)

---

## 🔑 Passo 3: Obter Chaves do Supabase

### Método 1: Dashboard Supabase
```
1. supabase.com/dashboard
2. Selecione "Porta_Tecno_IA"
3. Settings → API
4. Copie as chaves
```

### Método 2: Via Terminal (se tiver Supabase CLI)
```bash
supabase projects list
supabase projects api-keys --project-id zfeywfbfagjbarpcsskn
```

---

## 📝 Passo 4: Configurar no Vercel (Resumo)

1. **Ir para Settings**
   ```
   Seu Projeto → Settings → Environment Variables
   ```

2. **Adicionar cada variável:**
   - Nome: `VITE_SUPABASE_URL`
   - Valor: `https://zfeywfbfagjbarpcsskn.supabase.co`
   - Clique **"Save"**

3. **Repetir para VITE_SUPABASE_ANON_KEY**

4. **Selecionar ambientes** (recomendado):
   - ✅ Production
   - ✅ Preview
   - ✅ Development

---

## 🧪 Passo 5: Testar Deploy

### 5.1 Fazer Deploy Manual
```bash
cd seu_projeto
git push origin main
```

Vercel fará deploy automaticamente quando detectar push no GitHub.

### 5.2 Verificar Status
1. Vá para **Deployments** no Vercel
2. Aguarde até ficar **"Ready"** (verde)
3. Clique em **"Visit"** para abrir o site

### 5.3 Testar Funcionalidades
- ✅ Criar novo item
- ✅ Salvar no Supabase
- ✅ Buscar dados
- ✅ Tema claro/escuro
- ✅ Sincronização

---

## 🐛 Troubleshooting

### Erro: "VITE_SUPABASE_URL is not defined"
**Solução:**
1. Verifique se as variáveis foram adicionadas
2. Clique em **"Redeploy"** após adicionar variáveis
3. Aguarde novo build

### Erro: "Failed to connect to Supabase"
**Solução:**
1. Verifique se a URL está correta
2. Verifique se a chave anon está correta
3. Verifique se o Supabase está online

### Erro: "CORS error"
**Solução:**
1. Vá para Supabase → Settings → API
2. Verifique **CORS settings**
3. Adicione domínio Vercel: `https://seu-projeto.vercel.app`

---

## 📚 Variáveis de Ambiente Completas

```env
# ===== SUPABASE (OBRIGATÓRIO) =====
VITE_SUPABASE_URL=https://zfeywfbfagjbarpcsskn.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ===== GEMINI API (OPCIONAL) =====
VITE_GEMINI_API_KEY=AIzaSy...

# ===== APP CONFIG (OPCIONAL) =====
VITE_APP_NAME=Tecno Mapper
VITE_APP_VERSION=1.0.0
```

---

## ✅ Checklist Final

- [ ] Repositório no GitHub
- [ ] Conta Vercel criada
- [ ] Projeto importado no Vercel
- [ ] VITE_SUPABASE_URL adicionada
- [ ] VITE_SUPABASE_ANON_KEY adicionada
- [ ] Deploy realizado
- [ ] Site acessível
- [ ] Funcionalidades testadas

---

## 🔗 Links Úteis

- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Vite Docs](https://vitejs.dev)
- [Seu Repositório](https://github.com/danilocardosoweb/gerenciadorprocessos)

---

**Dúvidas?** Verifique os logs de deploy no Vercel ou entre em contato com o suporte.

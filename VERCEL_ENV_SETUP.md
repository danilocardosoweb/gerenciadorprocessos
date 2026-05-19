# 🔧 Configurar Variáveis de Ambiente no Vercel - Guia Visual

## ❌ Erro Que Você Está Recebendo

```
Uncaught Error: supabaseUrl is required.
```

**Causa:** As variáveis de ambiente não foram adicionadas no Vercel.

---

## ✅ Solução Passo a Passo

### **PASSO 1: Acessar Settings do Projeto**

1. Vá para seu projeto no Vercel: https://vercel.com/dashboard
2. Clique no seu projeto: **gerenciadorprocessos**
3. Vá para aba **Settings**

```
Dashboard → gerenciadorprocessos → Settings
```

---

### **PASSO 2: Ir para Environment Variables**

1. No menu esquerdo, clique em **Environment Variables**
2. Você verá a tela de adicionar variáveis

```
Settings → Environment Variables
```

---

### **PASSO 3: Adicionar Primeira Variável**

#### Campo 1: Key
```
VITE_SUPABASE_URL
```

#### Campo 2: Value
```
https://zfeywfbfagjbarpcsskn.supabase.co
```

#### Campo 3: Environments
- ✅ Production
- ✅ Preview
- ✅ Development

**Clique em "Save"**

---

### **PASSO 4: Adicionar Segunda Variável**

#### Campo 1: Key
```
VITE_SUPABASE_ANON_KEY
```

#### Campo 2: Value
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmZXl3ZmJmYWdqYmFycGNzc2tuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3MDA3NjAsImV4cCI6MjA3NjI3Njc2MH0.CM5LZ2WRx76DJavPR0EOfZgGzyvrXLnX4kcDCXVIPt8
```

#### Campo 3: Environments
- ✅ Production
- ✅ Preview
- ✅ Development

**Clique em "Save"**

---

## 🔄 PASSO 5: Fazer Redeploy

Após adicionar as variáveis, você precisa fazer um **novo deploy**:

### Opção A: Automático (Recomendado)
1. Vá para aba **Deployments**
2. Clique no último deploy
3. Clique em **"Redeploy"** (botão azul)
4. Aguarde até ficar **"Ready"** (verde)

### Opção B: Via Git
```bash
cd seu_projeto
git add .
git commit -m "Update environment variables"
git push origin main
```

Vercel fará deploy automaticamente.

---

## ✅ Verificar Se Funcionou

1. Aguarde o deploy ficar **"Ready"** (verde)
2. Clique em **"Visit"** para abrir seu site
3. Abra o **Console** (F12)
4. Procure por erros de Supabase

**Se não houver erro de "supabaseUrl"**, está funcionando! ✅

---

## 🐛 Se Ainda Não Funcionar

### Verificação 1: Variáveis Foram Salvas?
```
Settings → Environment Variables
```
Você deve ver 2 variáveis listadas:
- ✅ VITE_SUPABASE_URL
- ✅ VITE_SUPABASE_ANON_KEY

### Verificação 2: Fez Redeploy?
```
Deployments → Clique no último → Redeploy
```

### Verificação 3: Aguardou o Deploy Completar?
Espere até a barra ficar **100%** e status ser **"Ready"** (verde)

### Verificação 4: Limpou Cache do Navegador?
```
F12 → Application → Clear Site Data
```
Depois recarregue a página (Ctrl+Shift+R)

---

## 📋 Checklist Final

- [ ] Acessei Settings do projeto
- [ ] Fui para Environment Variables
- [ ] Adicionei VITE_SUPABASE_URL
- [ ] Adicionei VITE_SUPABASE_ANON_KEY
- [ ] Selecionei Production, Preview, Development
- [ ] Cliquei em Save para cada variável
- [ ] Fiz Redeploy do projeto
- [ ] Aguardei até ficar "Ready"
- [ ] Abri o site e não há erro de Supabase

---

## 🔗 Links Rápidos

- [Seu Projeto Vercel](https://vercel.com/dashboard/gerenciadorprocessos)
- [Seu Site Online](https://gerenciadorprocessos.vercel.app)
- [Supabase Dashboard](https://supabase.com/dashboard)

---

## 💡 Dica Extra

Se quiser testar localmente antes de fazer deploy:

1. Crie arquivo `.env.local` na raiz do projeto:
```
VITE_SUPABASE_URL=https://zfeywfbfagjbarpcsskn.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmZXl3ZmJmYWdqYmFycGNzc2tuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3MDA3NjAsImV4cCI6MjA3NjI3Njc2MH0.CM5LZ2WRx76DJavPR0EOfZgGzyvrXLnX4kcDCXVIPt8
```

2. Execute localmente:
```bash
npm run dev
```

3. Abra http://localhost:5173

Se funcionar localmente, vai funcionar no Vercel também!

---

**Pronto! Seu app estará online com Supabase funcionando!** 🚀

# Guia de Uso: Novos Campos de Guia, Arquivos e Imagens

## Resumo

Agora cada **ação (task)** nos nós do mapa mental pode ter:
- 📖 **Guia de Execução** (passo a passo)
- 📎 **Arquivos anexados** (PDF, Excel, Word)
- 🖼️ **Imagens de referência** (carrossel)
- ✅ **Fluxo OK/NOK** (o que fazer em cada cenário)

---

## Como Adicionar no Mapa Mental (NodeModal)

### 1. Abrir o Nó
1. No **Mapa Mental**, clique em qualquer nó
2. O modal abrirá com as abas:
   - **Detalhes Analíticos** (descrição)
   - **Guia de Execução** (novo!)
   - **Ações & Evidências** (tasks)

### 2. Adicionar Ação com Guia

#### A) Criar uma Ação
1. Na seção **"Ações & Evidências"**
2. Clique em **"Adicionar"**
3. Digite o nome da ação (ex: "Medir comprimento com paquímetro")
4. Clique no ícone **⛨ (Workflow)** na ação para expandir

#### B) Adicionar Guia de Execução

Com a ação expandida, clique na aba **"📖 Guia"**:

**Passo a Passo (howTo):**
1. Clique em **"Adicionar Passo"**
2. Preencha:
   - **Instrução**: O que fazer (ex: "Posicione a peça na bancada")
   - **Dica Visual**: Dica de como fazer (ex: "Bancada limpa e plana")
3. Repita para cada passo

**Se OK (Quando der certo):**
- **Resultado**: "Peça dentro da tolerância"
- **Ação**: "Libere para próxima etapa"
- **Próximo**: "Continue a produção"

**Se NOK (Quando der errado):**
- **Resultado**: "Peça FORA da tolerância"
- **Ação**: "ISOLAR peça imediatamente"
- **Próximo**: "Chame supervisor"

#### C) Anexar Arquivos

1. Na ação expandida, clique na aba **"📎 Arquivos"**
2. Clique em **"Adicionar Arquivo"**
3. Informe:
   - **Nome**: "Ficha de Inspeção.pdf"
   - **URL**: Link do arquivo (pode ser do Supabase Storage)
4. O sistema detecta automaticamente o tipo (PDF, Excel, Word)

#### D) Adicionar Imagens

1. Na ação expandida, clique na aba **"🖼️ Imagens"**
2. Clique em **"Adicionar Imagem"**
3. Cole a URL da imagem
4. Adicione quantas imagens precisar (aparecerão em carrossel)

---

## Estrutura de Dados no Banco

### Tabela: `process_items`

A coluna `node_details` armazena tudo em formato JSON:

```json
{
  "description": "Descrição do nó",
  "images": ["url1", "url2"],
  "tasks": [
    {
      "id": "abc123",
      "text": "Nome da ação",
      "completed": false,
      "howTo": [
        {
          "order": 1,
          "instruction": "Instrução passo 1",
          "visualHint": "Dica visual 1"
        }
      ],
      "ifOK": {
        "result": "Resultado quando OK",
        "action": "Ação a tomar",
        "nextStep": "Próximo passo",
        "alertLevel": "success"
      },
      "ifNOK": {
        "result": "Resultado quando NOK",
        "action": "Ação corretiva",
        "nextStep": "O que fazer",
        "alertLevel": "critical"
      },
      "tips": [
        {
          "icon": "scan",
          "message": "Dica rápida"
        }
      ],
      "files": [
        {
          "id": "file123",
          "name": "Documento.pdf",
          "url": "https://...",
          "type": "pdf"
        }
      ],
      "images": ["https://...", "https://..."]
    }
  ]
}
```

---

## Como Visualizar no Modo Operador

1. Entre no **Modo Operador** (botão "Operador" no topo)
2. Navegue até a etapa desejada
3. Nos itens do checklist, aparecerá o botão **"Ver Guia de Execução"**
4. Clique para expandir e ver:
   - Passo a passo
   - Arquivos para download
   - Carrossel de imagens
   - Fluxo OK/NOK

---

## Upload de Arquivos para o Supabase

Para arquivos funcionarem corretamente, faça upload para o **Supabase Storage**:

1. Acesse o dashboard do Supabase
2. Vá em **Storage** → **New Bucket** (ou use um existente)
3. Faça upload dos arquivos
4. Copie a URL pública
5. Cole essa URL no campo "URL do arquivo" no NodeModal

### Bucket recomendado: `process-documents`

```sql
-- Política de acesso público para leitura
CREATE POLICY "Public Read Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'process-documents');
```

---

## Exemplos Prontos

Algumas ações já vêm com guias pré-configurados:

- ✅ **"Identificar tolerâncias críticas no desenho"**
- ✅ **"Conferir tolerância (±0.5mm padrão, ±0.2mm precisão)"**
- ✅ **"Medir comprimento total com paquímetro"**

Para usar, basta criar uma ação com esses textos que o sistema carrega automaticamente o guia completo!

---

## Dicas

1. **Imagens**: Use URLs de serviços confiáveis (Unsplash, Imgur, ou Supabase Storage)
2. **Arquivos**: Prefira PDFs para formulários e planilhas Excel para tabelas
3. **Passos**: Mantenha instruções curtas e objetivas (máx 2-3 linhas)
4. **Dicas Visuais**: Use linguagem simples (ex: "Canto frontal direito", "Laser cobrindo código")

---

## Precisa de Ajuda?

Se encontrar problemas ao salvar, verifique:
1. O node_details está sendo salvo como JSON válido
2. URLs de arquivos/imagens estão acessíveis publicamente
3. O tamanho total do JSON não excede limites do banco

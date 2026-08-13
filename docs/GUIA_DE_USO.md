# Guia de Uso: Novos Campos de Guia, Arquivos e Imagens

## Resumo

Agora cada **a��o (task)** nos n�s do mapa mental pode ter:
- =� **Guia de Execu��o** (passo a passo)
- =� **Arquivos anexados** (PDF, Excel, Word)
- =� **Imagens de refer�ncia** (carrossel)
-  **Fluxo OK/NOK** (o que fazer em cada cen�rio)

---

## Como Adicionar no Mapa Mental (NodeModal)

### 1. Abrir o N�
1. No **Mapa Mental**, clique em qualquer n�
2. O modal abrir� com as abas:
   - **Detalhes Anal�ticos** (descri��o)
   - **Guia de Execu��o** (novo!)
   - **A��es & Evid�ncias** (tasks)

### 2. Adicionar A��o com Guia

#### A) Criar uma A��o
1. Na se��o **"A��es & Evid�ncias"**
2. Clique em **"Adicionar"**
3. Digite o nome da a��o (ex: "Medir comprimento com paqu�metro")
4. Clique no �cone **� (Workflow)** na a��o para expandir

#### B) Adicionar Guia de Execu��o

Com a a��o expandida, clique na aba **"=� Guia"**:

**Passo a Passo (howTo):**
1. Clique em **"Adicionar Passo"**
2. Preencha:
   - **Instru��o**: O que fazer (ex: "Posicione a pe�a na bancada")
   - **Dica Visual**: Dica de como fazer (ex: "Bancada limpa e plana")
3. Repita para cada passo

**Se OK (Quando der certo):**
- **Resultado**: "Pe�a dentro da toler�ncia"
- **A��o**: "Libere para pr�xima etapa"
- **Pr�ximo**: "Continue a produ��o"

**Se NOK (Quando der errado):**
- **Resultado**: "Pe�a FORA da toler�ncia"
- **A��o**: "ISOLAR pe�a imediatamente"
- **Pr�ximo**: "Chame supervisor"

#### C) Anexar Arquivos

1. Na a��o expandida, clique na aba **"=� Arquivos"**
2. Clique em **"Adicionar Arquivo"**
3. Informe:
   - **Nome**: "Ficha de Inspe��o.pdf"
   - **URL**: Link do arquivo (pode ser do Supabase Storage)
4. O sistema detecta automaticamente o tipo (PDF, Excel, Word)

#### D) Adicionar Imagens

1. Na a��o expandida, clique na aba **"=� Imagens"**
2. Clique em **"Adicionar Imagem"**
3. Cole a URL da imagem
4. Adicione quantas imagens precisar (aparecer�o em carrossel)

---

## Estrutura de Dados no Banco

### Tabela: `process_items`

A coluna `node_details` armazena tudo em formato JSON:

```json
{
  "description": "Descri��o do n�",
  "images": ["url1", "url2"],
  "tasks": [
    {
      "id": "abc123",
      "text": "Nome da a��o",
      "completed": false,
      "howTo": [
        {
          "order": 1,
          "instruction": "Instru��o passo 1",
          "visualHint": "Dica visual 1"
        }
      ],
      "ifOK": {
        "result": "Resultado quando OK",
        "action": "A��o a tomar",
        "nextStep": "Pr�ximo passo",
        "alertLevel": "success"
      },
      "ifNOK": {
        "result": "Resultado quando NOK",
        "action": "A��o corretiva",
        "nextStep": "O que fazer",
        "alertLevel": "critical"
      },
      "tips": [
        {
          "icon": "scan",
          "message": "Dica r�pida"
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

1. Entre no **Modo Operador** (bot�o "Operador" no topo)
2. Navegue at� a etapa desejada
3. Nos itens do checklist, aparecer� o bot�o **"Ver Guia de Execu��o"**
4. Clique para expandir e ver:
   - Passo a passo
   - Arquivos para download
   - Carrossel de imagens
   - Fluxo OK/NOK

---

## Upload de Arquivos para o Supabase

Para arquivos funcionarem corretamente, fa�a upload para o **Supabase Storage**:

1. Acesse o dashboard do Supabase
2. V� em **Storage** � **New Bucket** (ou use um existente)
3. Fa�a upload dos arquivos
4. Copie a URL p�blica
5. Cole essa URL no campo "URL do arquivo" no NodeModal

### Bucket recomendado: `process-documents`

```sql
-- Pol�tica de acesso p�blico para leitura
CREATE POLICY "Public Read Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'process-documents');
```

---

## Exemplos Prontos

Algumas a��es j� v�m com guias pr�-configurados:

-  **"Identificar toler�ncias cr�ticas no desenho"**
-  **"Conferir toler�ncia (�0.5mm padr�o, �0.2mm precis�o)"**
-  **"Medir comprimento total com paqu�metro"**

Para usar, basta criar uma a��o com esses textos que o sistema carrega automaticamente o guia completo!

---

## Dicas

1. **Imagens**: Use URLs de servi�os confi�veis (Unsplash, Imgur, ou Supabase Storage)
2. **Arquivos**: Prefira PDFs para formul�rios e planilhas Excel para tabelas
3. **Passos**: Mantenha instru��es curtas e objetivas (m�x 2-3 linhas)
4. **Dicas Visuais**: Use linguagem simples (ex: "Canto frontal direito", "Laser cobrindo c�digo")

---

## Precisa de Ajuda

Se encontrar problemas ao salvar, verifique:
1. O node_details est� sendo salvo como JSON v�lido
2. URLs de arquivos/imagens est�o acess�veis publicamente
3. O tamanho total do JSON n�o excede limites do banco

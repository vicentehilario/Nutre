# Plano de Implementação — Redesign + Histórico + Metas

**Spec:** `2026-03-30-redesign-historico-metas-design.md`
**Data:** 2026-03-30

---

## Fase 1 — Banco de dados (Supabase)

### 1.1 Migrar tabela `profiles`
Rodar no SQL Editor do Supabase:
```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS meta_calorica INTEGER DEFAULT 2000;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS meta_proteina INTEGER DEFAULT 120;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS objetivo TEXT DEFAULT 'perda_de_peso';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS refeicoes_por_dia INTEGER DEFAULT 4;
```

### 1.2 Criar tabela `refeicoes`
```sql
CREATE TABLE IF NOT EXISTS refeicoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  criado_em TIMESTAMPTZ DEFAULT now(),
  data DATE DEFAULT CURRENT_DATE,
  nome TEXT,
  calorias INTEGER DEFAULT 0,
  proteinas INTEGER DEFAULT 0,
  carboidratos INTEGER DEFAULT 0,
  gorduras INTEGER DEFAULT 0,
  dentro_do_plano BOOLEAN DEFAULT true,
  feedback TEXT
);
ALTER TABLE refeicoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_refeicoes" ON refeicoes
  FOR ALL USING (auth.uid() = user_id);
```

---

## Fase 2 — Sistema de design (tokens + componentes base)

### 2.1 Criar `src/lib/design-tokens.ts`
Exportar as constantes de cor, radius e tipografia definidas no spec.

### 2.2 Atualizar `tailwind.config.ts`
Adicionar as cores customizadas como tokens Tailwind (`nutre-green`, `nutre-dark`, etc).

### 2.3 Criar componente `BottomNav`
- Arquivo: `src/components/BottomNav.tsx`
- 4 itens: Início / Histórico / Metas / Perfil
- Prop `active: 'home' | 'historico' | 'metas' | 'perfil'`
- Substituir nav manual em cada tela

---

## Fase 3 — Redesign Home (`/app/page.tsx`)

### 3.1 Criar `CalorieSaldoCard`
- Arquivo: `src/components/CalorieSaldoCard.tsx`
- Props: `consumido`, `meta`, `proteinas`, `carboidratos`, `gorduras`
- Barra de progresso com cor dinâmica (verde → âmbar → vermelho)
- Badge "No plano" / "Acima da meta"

### 3.2 Atualizar `src/app/app/page.tsx`
- Buscar `meta_calorica` de profiles junto com os outros campos
- Buscar soma de `calorias` e macros das `refeicoes` de hoje
- Remover streak do header (mover para card separado ou subtítulo)
- Adicionar `<CalorieSaldoCard />`
- Atualizar visual dos cards Registrar e Socorro para novo design
- Usar `<BottomNav active="home" />`

---

## Fase 4 — API `/api/analisar` com persistência

### 4.1 Atualizar `src/app/api/analisar/route.ts`
- Receber `userId` e `data` no body além de `fotoUrl` e `descricao`
- Após parse da resposta Claude, fazer INSERT em `refeicoes`
- Fazer UPDATE em `profiles.fotos_hoje` (incremento)
- Atualizar streak se necessário (primeira refeição do dia)

### 4.2 Atualizar cliente da tela de registro
- `src/app/app/registrar/page.tsx` — passar `userId` e `data` na chamada à API

---

## Fase 4.5 — Importação de PDF do plano prescrito

### 4.5.1 Criar API `POST /api/importar-plano`
- Arquivo: `src/app/api/importar-plano/route.ts`
- Recebe: PDF como `multipart/form-data` + `userId` da sessão
- Envia o PDF para Claude com prompt: extrair meta_calorica, meta_proteina, refeicoes_por_dia, objetivo
- Faz UPDATE em `profiles` com os valores extraídos
- Salva `plano_pdf_importado_em` (timestamp) e `plano_origem: 'pdf'` em profiles
- Retorna os valores extraídos para o frontend preencher os campos

### 4.5.2 Adicionar colunas em `profiles`
```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plano_pdf_importado_em TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plano_origem TEXT DEFAULT 'manual';
-- plano_origem: 'manual' | 'pdf'
```

### 4.5.3 Atualizar `src/app/app/metas/page.tsx`
- Adicionar divisor "ou" + card de importação após a dica do Vicente
- Input `type="file" accept=".pdf"` oculto acionado pelo botão
- Loading state durante processamento ("Lendo seu plano...")
- Estado pós-importação: banner preto + campos readonly com ✓ + "Alterar manualmente"
- Link "Atualizar PDF ›" para reimportar

---

## Fase 5 — Tela Histórico (`/app/historico`)

### 5.1 Criar API `GET /api/refeicoes`
- Arquivo: `src/app/api/refeicoes/route.ts`
- Query params: `semana` (ISO week string, ex: `2026-W13`) ou `mes` (`2026-03`)
- Retorna: lista de refeições agrupadas por data + médias calculadas

### 5.2 Criar `WeekAvgBanner`
- Arquivo: `src/components/WeekAvgBanner.tsx`
- Props: `mediaKcal`, `mediaProteina`, `diasNoPlano`, `saldoMedio`
- Background preto, grid 2×2

### 5.3 Criar `DayMealCard`
- Arquivo: `src/components/DayMealCard.tsx`
- Props: `data`, `refeicoes[]`, `meta`
- Badge verde/vermelho de saldo
- Lista de refeições + barra de progresso

### 5.4 Criar `src/app/app/historico/page.tsx`
- Auth check com getSession()
- Tabs de semanas/meses (geradas a partir de datas com dados)
- Semana atual sempre visível
- Renderizar `WeekAvgBanner` + lista de `DayMealCard`
- Estado vazio se não houver registros
- `<BottomNav active="historico" />`

---

## Fase 6 — Tela Metas (`/app/metas`)

### 6.1 Criar API `POST /api/metas`
- Arquivo: `src/app/api/metas/route.ts`
- Body: `{ meta_calorica, meta_proteina, objetivo, refeicoes_por_dia }`
- UPDATE em `profiles` para o userId da sessão

### 6.2 Criar `MetaInput`
- Arquivo: `src/components/MetaInput.tsx`
- Props: `value`, `onChange`, `unit`
- Steppers: −100, −50, +50, +100

### 6.3 Criar `src/app/app/metas/page.tsx`
- Carregar valores atuais de `profiles`
- Formulário com `MetaInput` para kcal, campo para proteína
- Select para objetivo (perda_de_peso / manutencao / ganho_de_massa)
- "Dica do Vicente" — texto contextual baseado no objetivo selecionado
- Botão "Salvar" chama `/api/metas`
- `<BottomNav active="metas" />`

---

## Fase 7 — Redesign Perfil (`/app/perfil`)

- Atualizar visual para novo sistema de cards
- Sem mudança funcional
- Usar `<BottomNav active="perfil" />`

---

## Ordem de execução recomendada

1. Fase 1 (banco) — pré-requisito para tudo
2. Fase 2 (design system) — base para todos os componentes
3. Fase 3 (Home redesign) — impacto imediato e visível
4. Fase 4 (API com persistência) — habilita histórico
5. Fase 5 (Histórico) — nova feature principal
6. Fase 6 (Metas) — nova feature secundária
7. Fase 7 (Perfil) — polish final

---

## Estimativa de arquivos

| Arquivo | Ação |
|---|---|
| `src/lib/design-tokens.ts` | Criar |
| `tailwind.config.ts` | Atualizar |
| `src/components/BottomNav.tsx` | Criar |
| `src/components/CalorieSaldoCard.tsx` | Criar |
| `src/components/WeekAvgBanner.tsx` | Criar |
| `src/components/DayMealCard.tsx` | Criar |
| `src/components/MetaInput.tsx` | Criar |
| `src/app/app/page.tsx` | Atualizar |
| `src/app/app/perfil/page.tsx` | Atualizar |
| `src/app/app/registrar/page.tsx` | Atualizar |
| `src/app/app/historico/page.tsx` | Criar |
| `src/app/app/metas/page.tsx` | Criar |
| `src/app/api/analisar/route.ts` | Atualizar |
| `src/app/api/refeicoes/route.ts` | Criar |
| `src/app/api/metas/route.ts` | Criar |

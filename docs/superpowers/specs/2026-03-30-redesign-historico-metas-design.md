# Nutre — Redesign de Interface + Histórico + Metas

**Data:** 2026-03-30
**Status:** Aprovado para implementação

---

## 1. Contexto

O app Nutre atualmente tem 3 abas (Home, Socorro, Perfil) com visual básico em verde/laranja sem hierarquia tipográfica clara. A identidade visual precisa ser mais sofisticada para refletir o posicionamento premium do produto. Além disso, faltam duas funcionalidades centrais: histórico de refeições e configuração de meta calórica diária.

---

## 2. Identidade Visual

**Estilo:** Minimalista com personalidade — entre premium escuro (A) e branco minimalista (B).

| Token | Valor |
|---|---|
| Fundo principal | `#fafafa` |
| Fundo cards | `#ffffff` |
| Acento primário | `#16a34a` (verde) |
| Bloco premium/destaque | `#111111` (preto) |
| Texto primário | `#111111` |
| Texto secundário | `#999999` |
| Borda | `#f0f0f0` |
| Perigo / excesso | `#ef4444` (vermelho) |
| Alerta / quase | `#f59e0b` (âmbar) |
| Border radius cards | `20px` |
| Border radius botões | `14px` |
| Tipografia | SF Pro Display / -apple-system / Segoe UI |

**Princípio:** Cards em branco com borda sutil sobre fundo cinza muito claro. Números grandes e bold para dados relevantes (kcal, streak). Blocos pretos apenas para destaque máximo (banner de médias da semana, streak no home).

---

## 3. Arquitetura de Navegação

Passa de 3 para **4 abas** no bottom nav:

```
[ Início ] [ Histórico ] [ Metas ] [ Perfil ]
```

A aba "Socorro" (Momento Crítico) deixa de ser aba de navegação e vira card na Home, mantendo o botão CTA visível sem ocupar slot de nav.

---

## 4. Telas

### 4.1 Home (redesign)

**Hierarquia de informação:**
1. Saudação + nome + streak (header)
2. Card "Saldo de hoje" — número grande de kcal consumidas / meta, barra de progresso, macros (proteína / carbo / gordura)
3. Card "Registrar refeição" — contador de registros hoje, kcal restantes, botão CTA verde
4. Card Socorro — fundo laranja-claro, CTA laranja escuro

**Card "Saldo de hoje" (novo):**
- Exibe: `consumido / meta kcal`
- Barra de progresso verde → âmbar → vermelho conforme percentual
- Badge "✓ No plano" (verde) ou "Acima da meta" (vermelho)
- Grid de macros: Proteína / Carbo / Gordura em chips cinza

### 4.2 Histórico (nova tela)

**Layout:**
- Header com título e subtítulo
- Tabs horizontais com scroll: "Esta semana", "Semana passada", meses anteriores
- **Banner escuro (destaque premium):** Média da semana com 4 números: kcal/dia, proteína/dia, dias no plano (X/7), saldo médio em kcal
- Lista de cards por dia, do mais recente ao mais antigo
- Cada card de dia: data, badge de saldo (verde se abaixo da meta, vermelho se acima), lista de refeições com nome e kcal, barra de progresso do dia

**Badge de saldo:**
- `−760 kcal` (verde) = consumiu menos que a meta → no plano
- `+240 kcal` (vermelho) = consumiu mais que a meta → acima

**Semanas e meses:**
- A tab "Esta semana" sempre aparece, mesmo sem registros (mostra estado vazio)
- Tabs de semanas/meses anteriores geradas dinamicamente apenas se houver refeições registradas naquele período
- Se não houver dados em uma tab selecionada, mostrar estado vazio com mensagem encorajadora

### 4.3 Metas (nova tela)

**Seções:**
1. **Meta calórica diária** — input com valor atual + 4 steppers (−100, −50, +50, +100) + botão "Salvar meta"
2. **Outras metas** — lista com: Meta de proteína (g), Objetivo (perda de peso / manutenção / ganho de massa), Refeições por dia
3. **Dica contextual do Vicente** — card verde claro com mensagem gerada a partir do objetivo selecionado. Não referenciar canais de suporte (WhatsApp, etc.) pois usuários desse plano não têm acompanhamento.
4. **Divisor "ou"** + **Card de importação de PDF** — CTA para usuários que possuem prescrição nutricional do Vicente

**Fluxo de importação de PDF:**
- Usuário toca "Importar minha dieta" → seletor de arquivo (PDF)
- PDF é enviado para `/api/importar-plano`
- Claude lê o PDF e extrai: meta calórica, meta de proteína, refeições por dia, objetivo
- App preenche automaticamente todos os campos de meta
- Tela exibe banner preto "Plano prescrito pelo Vicente · Metas sincronizadas"
- Valores ficam marcados com ✓ e podem ser editados manualmente ("Alterar manualmente")
- Opção "Atualizar PDF ›" para reimportar plano novo

**Mensagem pós-importação (Dica do Vicente):**
> "Esse plano foi montado especificamente pra você. Segue as metas, registra as refeições e acompanha seu saldo diário aqui no app."

**Persistência:** Meta calórica salva na coluna `meta_calorica` da tabela `profiles`. Objetivo e proteína também em `profiles`.

### 4.4 Perfil (ajuste visual)

Sem mudança funcional. Apenas redesign visual para seguir o novo sistema de cards (border-radius, tipografia, cores).

---

## 5. Modelo de Dados

### 5.1 Alterações na tabela `profiles` (Supabase)

```sql
ALTER TABLE profiles ADD COLUMN meta_calorica INTEGER DEFAULT 2000;
ALTER TABLE profiles ADD COLUMN meta_proteina INTEGER DEFAULT 120;
ALTER TABLE profiles ADD COLUMN objetivo TEXT DEFAULT 'perda_de_peso';
-- objetivo: 'perda_de_peso' | 'manutencao' | 'ganho_de_massa'
ALTER TABLE profiles ADD COLUMN refeicoes_por_dia INTEGER DEFAULT 4;
```

### 5.2 Nova tabela `refeicoes`

```sql
CREATE TABLE refeicoes (
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

-- RLS
ALTER TABLE refeicoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_refeicoes" ON refeicoes
  FOR ALL USING (auth.uid() = user_id);
```

### 5.3 Fluxo de persistência (API /api/analisar)

Atualmente a API analisa e retorna JSON mas **não salva no banco**. Na nova versão:
1. API recebe foto/descrição + `userId` + `data`
2. Chama Claude e obtém `{ calorias, proteinas, carboidratos, gorduras, dentro_do_plano, feedback }`
3. Faz INSERT na tabela `refeicoes`
4. Faz UPDATE em `profiles.fotos_hoje` + incremento de streak se necessário
5. Retorna a análise normalemnte

---

## 6. Novos Componentes

| Componente | Localização | Responsabilidade |
|---|---|---|
| `CalorieSaldoCard` | `components/CalorieSaldoCard.tsx` | Exibe kcal consumidas/meta + macros + barra |
| `WeekAvgBanner` | `components/WeekAvgBanner.tsx` | Banner preto com médias da semana |
| `DayMealCard` | `components/DayMealCard.tsx` | Card de um dia com lista de refeições e barra |
| `MetaInput` | `components/MetaInput.tsx` | Input numérico + steppers para meta calórica |
| `BottomNav` | `components/BottomNav.tsx` | Nav de 4 abas com estado ativo |

---

## 7. Novas Rotas

| Rota | Tipo | Descrição |
|---|---|---|
| `/app/historico` | Page | Tela de histórico com tabs por semana |
| `/app/metas` | Page | Tela de configuração de metas |
| `/api/refeicoes` | API Route (GET) | Lista refeições do usuário filtradas por semana |
| `/api/metas` | API Route (POST) | Salva metas do usuário no profiles |

---

## 8. Tratamento de Erros e Edge Cases

- **Sem refeições registradas:** Histórico mostra estado vazio com CTA para registrar primeira refeição
- **Meta não configurada:** Home exibe 2000 kcal como padrão até o usuário configurar
- **Refeição sem calorias:** API retorna 0 — exibir "—" ao invés de "0 kcal"
- **Saldo de dia incompleto (dia em curso):** Badge mostra "em andamento" ao invés de saldo final
- **Usuário plano grátis:** Histórico exibe apenas os últimos 7 dias. Semanas anteriores ficam bloqueadas com CTA de upgrade

---

## 9. Fora de Escopo (não implementar agora)

- Gráfico de linhas de evolução calórica semanal
- Export de dados (PDF/CSV)
- Compartilhamento de refeição nas redes sociais
- Integração com apps de saúde (Apple Health, Google Fit)

---

## 10. Critérios de Aceitação

- [ ] Home exibe saldo de kcal do dia em tempo real após cada registro
- [ ] Histórico lista todas as refeições agrupadas por dia
- [ ] Banner de médias da semana calcula corretamente a média de kcal e proteína
- [ ] Badge de saldo (verde/vermelho) reflete comparação com a meta configurada pelo usuário
- [ ] Usuário consegue alterar meta calórica e o valor persiste entre sessões
- [ ] Nav bottom com 4 abas funcionando em todas as telas
- [ ] Visual consistente em iPhone Safari e Android Chrome
- [ ] Refeições são salvas no banco após análise pela IA

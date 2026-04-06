# Landing Page — Design Spec
**Data:** 2026-04-05
**Status:** Aprovado pelo usuário

---

## Objetivo

Converter visitantes em assinantes do Nutre. Público-alvo: pessoas que querem emagrecer e acompanhar calorias. A presença pessoal de Vicente Hilário (nutricionista, CRN4 23101536) como autor da metodologia é diferencial central de autoridade.

---

## Seções da página (em ordem)

### 1. Nav
- Logo estilo Hotmart: ícone quadrado escuro com "N" branco + folhinha verde no canto
- Nome "Nutre" ao lado
- Botão CTA "Começar grátis" verde escuro (direita)
- Fixo no topo com backdrop-filter blur

### 2. Hero (split)
- Fundo branco (esquerda) / cinza claro (direita)
- Esquerda: eyebrow "Nutricionista · CRN4 23101536", título grande "Pare de adivinhar o que **comer.**", subtítulo, 2 CTAs ("Experimentar grátis" e "Como funciona"), prova social "+600 pacientes"
- Direita: foto de Vicente com telefone (vicente-hero.jpg), card flutuante credencial, card flutuante "+600 pacientes atendidos"

### 3. Dor (fundo escuro #0f2414)
- 3 cards: "Não sei quantas calorias tem", "Toda dieta é rígida demais", "Na hora da vontade não tenho com quem falar"

### 4. Como funciona (fundo branco)
- 3 passos em linha com conector
- Abaixo de cada passo: mockup de celular em CSS mostrando a tela real do app
  - Passo 1: câmera com viewfinder
  - Passo 2: análise nutricional (macros + kcal total)
  - Passo 3: progresso semanal com streak e gráfico de barras

### 5. Autoridade (fundo cinza claro)
- Foto de Vicente braços cruzados (vicente-autoridade.jpg) com badge "+600 pacientes atendidos"
- Texto: "Formado há 3 anos, já atendi mais de 600 pacientes..."
- Badge CRN4 23101536

### 6. Depoimentos (fundo branco)
- Grid 3 colunas, 6 cards (5 pacientes reais + 1 CTA card)
- Pacientes: André (calça 58→54), Helena (físico e mental), Leticia (59→55kg), Margot (fim da fome), Camilly (reeducação alimentar)
- 1 card destacado (fundo escuro) = André

### 7. Planos (fundo cinza claro)
- 3 colunas: Grátis (R$0), Premium Mensal (R$47/mês, destaque escuro), Premium Anual (R$397/ano, −30%)
- Links Hotmart reais já inseridos

### 8. CTA Final (fundo verde escuro)
- Título grande, botão branco
- "Sem cartão de crédito · Cancele quando quiser"

### 9. Footer
- Logo pequeno + nome + CRN + copyright

---

## Estilo visual

- **Paleta verde:** `#0f2414` (900), `#1a3a20` (800), `#1e5128` (700), `#4a9157` (400)
- **Tipografia:** Inter, pesos 400–900
- **Logo:** N em fonte bold + folhinha verde CSS (estilo capa Hotmart)
- **Fotos:** `public/vicente-hero.jpg`, `public/vicente-autoridade.jpg`
- **Sem emojis** decorativos (apenas nos mockups internos do app)

---

## Implementação

- Substituir `src/app/page.tsx` pela landing page completa em Next.js
- Usar `"use client"` com lógica de redirect se usuário já estiver logado
- Fotos em `public/` servidas diretamente pelo Next.js
- Logo como componente React reutilizável (`<NutreLogo />`)
- Ícones do app (apple-touch-icon, icon-192, icon-512) a atualizar para estilo N+folhinha (separado)

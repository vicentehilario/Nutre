-- Rodar no Supabase SQL Editor
-- Adiciona colunas de rastreamento de influenciadores e renovações

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS cupom TEXT,                    -- código do cupom usado na compra
  ADD COLUMN IF NOT EXISTS afiliado TEXT,                 -- nome do afiliado/influenciador (vindo do Hotmart)
  ADD COLUMN IF NOT EXISTS renovacoes INTEGER DEFAULT 0,  -- quantas vezes renovou
  ADD COLUMN IF NOT EXISTS offer_code TEXT,               -- código da oferta (5sks6hjc, w71953zf, arsue9iw)
  ADD COLUMN IF NOT EXISTS plano_ativado_em TIMESTAMPTZ;  -- quando ativou o plano pago (para calcular meses ativo)

-- Índice para buscar por cupom rapidamente
CREATE INDEX IF NOT EXISTS idx_profiles_cupom ON profiles (cupom);

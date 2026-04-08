-- =============================================================
-- Volta à Ilha 2026 — Schema inicial + seed
-- =============================================================

-- Tabela de configuração da prova (singleton — id = 1)
CREATE TABLE IF NOT EXISTS race_config (
  id INT PRIMARY KEY DEFAULT 1,
  start_time TIMESTAMPTZ,
  is_started BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de trechos
CREATE TABLE IF NOT EXISTS segments (
  id INT PRIMARY KEY,
  segment_number INT NOT NULL,
  athlete TEXT NOT NULL,
  route_name TEXT NOT NULL,
  distance_km DECIMAL(5,2) NOT NULL,
  estimated_duration_seconds INT NOT NULL,
  planned_start_time TIMESTAMPTZ NOT NULL,
  planned_finish_time TIMESTAMPTZ NOT NULL,
  actual_start_time TIMESTAMPTZ,
  actual_finish_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS: leitura pública, escrita apenas autenticada
ALTER TABLE race_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE segments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_race_config" ON race_config
  FOR SELECT USING (true);

CREATE POLICY "public_read_segments" ON segments
  FOR SELECT USING (true);

-- Service role bypassa RLS automaticamente

-- =============================================================
-- Seed: race_config (singleton)
-- =============================================================
INSERT INTO race_config (id, is_started) VALUES (1, FALSE)
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- Seed: segments
-- Largada planejada: 11/04/2026 às 06:10 BRT (= 09:10 UTC)
-- Todos os timestamps em UTC
-- =============================================================
INSERT INTO segments (
  id, segment_number, athlete, route_name,
  distance_km, estimated_duration_seconds,
  planned_start_time, planned_finish_time
) VALUES
  (1,  1,  'Fabio',    'Beiramar → João Paulo',           7.2,  2340, '2026-04-11T09:10:00Z', '2026-04-11T09:49:00Z'),
  (2,  2,  'Fabio',    'João Paulo → Office Park',        4.0,  1320, '2026-04-11T09:49:00Z', '2026-04-11T10:11:00Z'),
  (3,  3,  'Lara',     'Office Park → St. Antônio',       8.3,  3000, '2026-04-11T10:11:00Z', '2026-04-11T11:01:00Z'),
  (4,  4,  'Renata',   'St. Antônio → Daniela',           8.0,  2280, '2026-04-11T11:01:00Z', '2026-04-11T11:39:00Z'),
  (5,  5,  'Renata',   'Daniela → Jurerê',                5.1,  1560, '2026-04-11T11:39:00Z', '2026-04-11T12:05:00Z'),
  (6,  6,  'Lara',     'Jurerê → Cachoeira',              5.3,  1800, '2026-04-11T12:05:00Z', '2026-04-11T12:35:00Z'),
  (7,  7,  'Renata',   'Cachoeira → Brava',               9.3,  3240, '2026-04-11T12:35:00Z', '2026-04-11T13:29:00Z'),
  (8,  8,  'Jeferson', 'Brava → Ingleses',                5.2,  1860, '2026-04-11T13:29:00Z', '2026-04-11T14:00:00Z'),
  (9,  9,  'Jeferson', 'Ingleses → Santinho',             4.7,  1320, '2026-04-11T14:00:00Z', '2026-04-11T14:22:00Z'),
  (10, 10, 'Jeferson', 'Santinho → Moçambique',           8.4,  2640, '2026-04-11T14:22:00Z', '2026-04-11T15:06:00Z'),
  (11, 11, 'Renata',   'Moçambique → Barra',              5.7,  1740, '2026-04-11T15:06:00Z', '2026-04-11T15:35:00Z'),
  (12, 12, 'Fabio',    'Barra → Joaquina',                8.1,  3060, '2026-04-11T15:35:00Z', '2026-04-11T16:26:00Z'),
  (13, 13, 'Lara',     'Joaquina → Novo Campeche',        4.9,  1920, '2026-04-11T16:26:00Z', '2026-04-11T16:58:00Z'),
  (14, 14, 'Lara',     'Novo Campeche → Armação',         7.7,  3180, '2026-04-11T16:58:00Z', '2026-04-11T17:51:00Z'),
  (15, 15, 'Renata',   'Armação → Açores',                9.3,  2820, '2026-04-11T17:51:00Z', '2026-04-11T18:38:00Z'),
  (16, 16, 'Fabio',    'Açores → Tapera',                16.4,  6300, '2026-04-11T18:38:00Z', '2026-04-11T20:23:00Z'),
  (17, 17, 'Lara',     'Tapera → Carianos',               8.0,  2700, '2026-04-11T20:23:00Z', '2026-04-11T21:08:00Z'),
  (18, 18, 'Jeferson', 'Carianos → Via Expressa Sul',     7.2,  2040, '2026-04-11T21:08:00Z', '2026-04-11T21:42:00Z'),
  (19, 19, 'Jeferson', 'Via Expressa Sul → Chegada',      6.1,  1680, '2026-04-11T21:42:00Z', '2026-04-11T22:10:00Z')
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- Habilitar Realtime nas tabelas (executar no Supabase Dashboard
-- ou via SQL após criar as tabelas)
-- =============================================================
-- ALTER PUBLICATION supabase_realtime ADD TABLE segments;
-- ALTER PUBLICATION supabase_realtime ADD TABLE race_config;

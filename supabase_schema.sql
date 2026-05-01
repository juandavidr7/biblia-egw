-- Tabla de perfiles de usuario (Nombre y PIN)
CREATE TABLE profiles (
  username text PRIMARY KEY,
  pin text NOT NULL,
  current_day integer DEFAULT 1,
  completed_days integer[] DEFAULT '{}',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_seen timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla de metadata de semanas
CREATE TABLE weeks_meta (
  week_id integer PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  day_start integer NOT NULL,
  day_end integer NOT NULL
);

-- Tabla de días de lectura
CREATE TABLE reading_days (
  global_day integer PRIMARY KEY,
  week_id integer REFERENCES weeks_meta(week_id),
  day_in_week integer NOT NULL,
  title text NOT NULL,
  subtitle text NOT NULL,
  estimated_minutes integer NOT NULL,
  content jsonb NOT NULL
);

-- Habilitar RLS (Opcional, pero buena práctica)
-- Por ahora lo configuramos permisivo para el rol anon (nuestro frontend) para no bloquear la app
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE weeks_meta ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all" ON profiles FOR SELECT USING (true);
CREATE POLICY "Enable insert for all" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all" ON profiles FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all" ON weeks_meta FOR SELECT USING (true);
CREATE POLICY "Enable read access for all" ON reading_days FOR SELECT USING (true);

-- (Nota: Para seeding masivo, tal vez necesitemos dar acceso INSERT a las otras tablas temporalmente)
CREATE POLICY "Enable insert for all" ON weeks_meta FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all" ON weeks_meta FOR UPDATE USING (true);
CREATE POLICY "Enable insert for all" ON reading_days FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all" ON reading_days FOR UPDATE USING (true);

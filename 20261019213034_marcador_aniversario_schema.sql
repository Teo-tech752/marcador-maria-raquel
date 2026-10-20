/*
# Marcador Oficial — Semana de Aniversario Colegio María Raquel (45 años)

## Resumen
Crea el esquema completo del marcador oficial para la semana de aniversario
(19 al 23 de octubre de 2026). Modela alianzas, actividades, resultados por
actividad, estado del evento, aviso importante por lluvias e historial de
modificaciones. Incluye sincronización en tiempo real vía Supabase Realtime
(suscripción desde el frontend) y políticas RLS estrictas:

- Lectura pública (anon) de TODO lo que el marcador necesita para pintarse.
- Escritura SOLAMENTE para usuarios autenticados (el administrador).
- No se permite registro público de cuentas (se gestiona desde el panel de
  Supabase / por el administrador del proyecto).

## Tablas nuevas

1. `alliances`
   - `id` (uuid, pk)
   - `code` (text, único: 'amarilla' | 'verde' | 'azul')
   - `name` (text: nombre completo de la alianza)
   - `color_hex` (text: color principal)
   - `accent_hex` (text: color de acento)
   - `created_at` (timestamptz)

2. `activities`
   - `id` (uuid, pk)
   - `day` (text: 'lunes' | 'martes' | 'miercoles' | 'jueves_manana' | 'jueves_tarde' | 'viernes')
   - `title` (text: nombre de la actividad)
   - `location` (text, nullable: lugar, ej. "Cancha Astaburuaga")
   - `scheduled_time` (text, nullable: hora en texto, ej. "10:30")
   - `order_index` (int: orden dentro del día)
   - `status` (text: 'pendiente' | 'en_desarrollo' | 'finalizada' | 'suspendida')
   - `is_highlighted` (bool: actividad destacada/actual)
   - `created_at` (timestamptz)

3. `results`
   - `id` (uuid, pk)
   - `activity_id` (uuid, fk a activities)
   - `alliance_id` (uuid, fk a alliances)
   - `points` (int: puntos asignados; puede ser 0)
   - `notes` (text, nullable: observaciones)
   - `recorded_at` (timestamptz: fecha/hora del registro)
   - `created_at` (timestamptz)

   Restricción de unicidad: (activity_id, alliance_id) — evita duplicar el
   resultado de una alianza para una misma actividad.

4. `event_state` (singleton: una sola fila)
   - `id` (int, pk, siempre 1)
   - `status` (text: 'en_desarrollo' | 'pausado' | 'finalizado')
   - `winner_alliance_id` (uuid, nullable: alianza ganadora definitiva)
   - `featured_activity_id` (uuid, nullable: actividad destacada actual)
   - `last_updated_at` (timestamptz)
   - `updated_by` (uuid, nullable: auth uid del admin)

5. `rain_notice`
   - `id` (int, pk, siempre 1)
   - `text` (text: aviso importante)
   - `is_visible` (bool: si el aviso se muestra)
   - `updated_at` (timestamptz)

6. `change_log`
   - `id` (uuid, pk)
   - `action` (text: 'result_create' | 'result_update' | 'result_delete' | 'activity_status' | 'event_state' | 'notice_update' | 'winner_set')
   - `description` (text: descripción legible del cambio)
   - `payload` (jsonb: datos relevantes del cambio)
   - `actor_email` (text, nullable: correo del admin)
   - `created_at` (timestamptz)

## Seguridad (RLS)

- `alliances`, `activities`, `results`, `event_state`, `rain_notice`,
  `change_log`: SELECT público para anon y authenticated (el marcador es
  público). Escritura (INSERT/UPDATE/DELETE) SOLAMENTE para authenticated
  (el administrador). No hay registro público de cuentas.
- Las escrituras quedan protegidas: un usuario anónimo con la anon key NO
  puede insertar, actualizar ni eliminar filas.

## Notas importantes

1. Los puntajes NO se guardan como un total acumulado; se calculan sumando
   los `results.points` por alianza. Así la clasificación siempre refleja
   los resultados reales registrados.
2. Las alianzas se siembran con código, nombre y colores. Si la tabla ya
   tiene datos, no se sobreescriben (los puntajes existentes se conservan
   porque se calculan desde `results`).
3. Las actividades del programa oficial se siembran con estado 'pendiente'
   y `is_highlighted = false`. Si la tabla ya tiene filas, no se insertan
   duplicados (verificación por día+orden+titulo).
4. `event_state` se inicializa con una fila (id=1) en estado 'en_desarrollo',
   sin ganador.
5. `rain_notice` se inicializa con el texto oficial indicado por el
   colegio, visible por defecto.
6. `change_log` arranca vacío y se llena mediante un trigger每当 se
   inserta/actualiza/elimina un resultado, cambia el estado de una
   actividad, el estado del evento o el aviso. El actor se toma de
   `auth.jwt() -> email` cuando está disponible.
*/

-- ============ TABLAS ============

CREATE TABLE IF NOT EXISTS alliances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  color_hex text NOT NULL,
  accent_hex text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day text NOT NULL,
  title text NOT NULL,
  location text,
  scheduled_time text,
  order_index int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pendiente',
  is_highlighted boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  alliance_id uuid NOT NULL REFERENCES alliances(id) ON DELETE CASCADE,
  points int NOT NULL DEFAULT 0,
  notes text,
  recorded_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE (activity_id, alliance_id)
);

CREATE TABLE IF NOT EXISTS event_state (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  status text NOT NULL DEFAULT 'en_desarrollo',
  winner_alliance_id uuid REFERENCES alliances(id) ON DELETE SET NULL,
  featured_activity_id uuid REFERENCES activities(id) ON DELETE SET NULL,
  last_updated_at timestamptz DEFAULT now(),
  updated_by uuid
);

CREATE TABLE IF NOT EXISTS rain_notice (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  text text NOT NULL,
  is_visible boolean NOT NULL DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS change_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  description text NOT NULL,
  payload jsonb,
  actor_email text,
  created_at timestamptz DEFAULT now()
);

-- ============ RLS ============

ALTER TABLE alliances ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE rain_notice ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_log ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública (anon + authenticated)
DROP POLICY IF EXISTS "public_select_alliances" ON alliances;
CREATE POLICY "public_select_alliances" ON alliances
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_select_activities" ON activities;
CREATE POLICY "public_select_activities" ON activities
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_select_results" ON results;
CREATE POLICY "public_select_results" ON results
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_select_event_state" ON event_state;
CREATE POLICY "public_select_event_state" ON event_state
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_select_rain_notice" ON rain_notice;
CREATE POLICY "public_select_rain_notice" ON rain_notice
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_select_change_log" ON change_log;
CREATE POLICY "public_select_change_log" ON change_log
  FOR SELECT TO anon, authenticated USING (true);

-- Políticas de escritura: SOLO authenticated (el admin)
DROP POLICY IF EXISTS "auth_insert_alliances" ON alliances;
CREATE POLICY "auth_insert_alliances" ON alliances
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_alliances" ON alliances;
CREATE POLICY "auth_update_alliances" ON alliances
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_insert_activities" ON activities;
CREATE POLICY "auth_insert_activities" ON activities
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_activities" ON activities;
CREATE POLICY "auth_update_activities" ON activities
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_activities" ON activities;
CREATE POLICY "auth_delete_activities" ON activities
  FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_results" ON results;
CREATE POLICY "auth_insert_results" ON results
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_results" ON results;
CREATE POLICY "auth_update_results" ON results
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_results" ON results;
CREATE POLICY "auth_delete_results" ON results
  FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_update_event_state" ON event_state;
CREATE POLICY "auth_update_event_state" ON event_state
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_rain_notice" ON rain_notice;
CREATE POLICY "auth_update_rain_notice" ON rain_notice
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_insert_change_log" ON change_log;
CREATE POLICY "auth_insert_change_log" ON change_log
  FOR INSERT TO authenticated WITH CHECK (true);

-- ============ TRIGGER: historial automático ============
-- Función que registra cambios en change_log. Se invoca desde triggers.
CREATE OR REPLACE FUNCTION log_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
  v_action text;
  v_desc text;
  v_payload jsonb;
BEGIN
  v_email := coalesce(
    (auth.jwt() ->> 'email'),
    (auth.jwt() -> 'user_metadata' ->> 'email'),
    'admin'
  );

  v_action := TG_ARGV[0];

  IF TG_OP = 'INSERT' THEN
    v_desc := coalesce(TG_ARGV[1], 'Registro creado');
    v_payload := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    v_desc := coalesce(TG_ARGV[1], 'Registro actualizado');
    v_payload := jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW));
  ELSIF TG_OP = 'DELETE' THEN
    v_desc := coalesce(TG_ARGV[1], 'Registro eliminado');
    v_payload := to_jsonb(OLD);
  END IF;

  INSERT INTO change_log (action, description, payload, actor_email)
  VALUES (v_action, v_desc, v_payload, v_email);

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_log_result_insert ON results;
CREATE TRIGGER trg_log_result_insert
  AFTER INSERT ON results
  FOR EACH ROW EXECUTE FUNCTION log_change('result_create', 'Resultado registrado');

DROP TRIGGER IF EXISTS trg_log_result_update ON results;
CREATE TRIGGER trg_log_result_update
  AFTER UPDATE ON results
  FOR EACH ROW EXECUTE FUNCTION log_change('result_update', 'Resultado corregido');

DROP TRIGGER IF EXISTS trg_log_result_delete ON results;
CREATE TRIGGER trg_log_result_delete
  AFTER DELETE ON results
  FOR EACH ROW EXECUTE FUNCTION log_change('result_delete', 'Resultado eliminado');

DROP TRIGGER IF EXISTS trg_log_activity_status ON activities;
CREATE TRIGGER trg_log_activity_status
  AFTER UPDATE OF status, is_highlighted ON activities
  FOR EACH ROW WHEN (OLD.status IS DISTINCT FROM NEW.status OR OLD.is_highlighted IS DISTINCT FROM NEW.is_highlighted)
  EXECUTE FUNCTION log_change('activity_status', 'Estado de actividad actualizado');

DROP TRIGGER IF EXISTS trg_log_event_state ON event_state;
CREATE TRIGGER trg_log_event_state
  AFTER UPDATE ON event_state
  FOR EACH ROW EXECUTE FUNCTION log_change('event_state', 'Estado del evento actualizado');

DROP TRIGGER IF EXISTS trg_log_rain_notice ON rain_notice;
CREATE TRIGGER trg_log_rain_notice
  AFTER UPDATE ON rain_notice
  FOR EACH ROW EXECUTE FUNCTION log_change('notice_update', 'Aviso importante actualizado');

-- ============ REALTIME ============
-- Publicar las tablas relevantes en el canal de realtime para que el
-- frontend se suscriba y actualice la clasificación automáticamente.
ALTER PUBLICATION supabase_realtime ADD TABLE results;
ALTER PUBLICATION supabase_realtime ADD TABLE activities;
ALTER PUBLICATION supabase_realtime ADD TABLE event_state;
ALTER PUBLICATION supabase_realtime ADD TABLE rain_notice;
ALTER PUBLICATION supabase_realtime ADD TABLE alliances;

-- ============ SEED: ALIANZAS ============
INSERT INTO alliances (code, name, color_hex, accent_hex)
SELECT * FROM (VALUES
  ('amarilla', 'Sol y Fuego',  '#facc15', '#f59e0b'),
  ('verde',    'Tierra y Bosque', '#22c55e', '#15803d'),
  ('azul',     'Agua y Hielo', '#38bdf8', '#0369a1')
) AS v(code, name, color_hex, accent_hex)
WHERE NOT EXISTS (SELECT 1 FROM alliances);

-- ============ SEED: EVENT STATE ============
INSERT INTO event_state (id, status, winner_alliance_id, featured_activity_id)
SELECT 1, 'en_desarrollo', NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM event_state);

-- ============ SEED: RAIN NOTICE ============
INSERT INTO rain_notice (id, text, is_visible)
SELECT 1, 'IMPORTANTE: Las actividades programadas están sujetas a cambios debido a las lluvias pronosticadas. Cualquier modificación será informada oportunamente por el colegio.', true
WHERE NOT EXISTS (SELECT 1 FROM rain_notice);

-- ============ SEED: ACTIVIDADES ============
-- Inserta el programa oficial solo si la tabla está vacía.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM activities) THEN
    -- Lunes 19
    INSERT INTO activities (day, title, location, scheduled_time, order_index, status) VALUES
      ('lunes', 'Acto oficial de aniversario', NULL, NULL, 1, 'pendiente'),
      ('lunes', 'Fotografía para redes sociales', NULL, NULL, 2, 'pendiente');
    -- Martes 20
    INSERT INTO activities (day, title, location, scheduled_time, order_index, status) VALUES
      ('martes', 'Presentación de las alianzas', NULL, NULL, 1, 'pendiente'),
      ('martes', 'Grito de la alianza', NULL, NULL, 2, 'pendiente'),
      ('martes', 'Lienzo de la alianza', NULL, NULL, 3, 'pendiente'),
      ('martes', 'Rey y reina', NULL, NULL, 4, 'pendiente'),
      ('martes', 'Gymkhana del saber: Lenguaje e Inglés', NULL, NULL, 5, 'pendiente'),
      ('martes', 'Mesa pide', NULL, NULL, 6, 'pendiente');
    -- Miércoles 21
    INSERT INTO activities (day, title, location, scheduled_time, order_index, status) VALUES
      ('miercoles', 'Acto litúrgico', NULL, '10:30', 1, 'pendiente'),
      ('miercoles', 'Mesa pide matemática', NULL, NULL, 2, 'pendiente'),
      ('miercoles', 'Quemando elementos', NULL, NULL, 3, 'pendiente'),
      ('miercoles', 'Desafíos rápidos', NULL, NULL, 4, 'pendiente');
    -- Jueves 22 mañana (Cancha Astaburuaga)
    INSERT INTO activities (day, title, location, scheduled_time, order_index, status) VALUES
      ('jueves_manana', 'Acondicionamiento físico', 'Cancha Astaburuaga', NULL, 1, 'pendiente'),
      ('jueves_manana', 'Fútbol', 'Cancha Astaburuaga', NULL, 2, 'pendiente'),
      ('jueves_manana', 'Mesa pide', 'Cancha Astaburuaga', NULL, 3, 'pendiente'),
      ('jueves_manana', 'Atletismo', 'Cancha Astaburuaga', NULL, 4, 'pendiente');
    -- Jueves 22 tarde (Colegio)
    INSERT INTO activities (day, title, location, scheduled_time, order_index, status) VALUES
      ('jueves_tarde', 'Show de talentos', 'Colegio María Raquel', NULL, 1, 'pendiente'),
      ('jueves_tarde', 'Mesa pide', 'Colegio María Raquel', NULL, 2, 'pendiente'),
      ('jueves_tarde', 'Gymkhana del saber: Historia y Ciencias', 'Colegio María Raquel', NULL, 3, 'pendiente');
    -- Viernes 23
    INSERT INTO activities (day, title, location, scheduled_time, order_index, status) VALUES
      ('viernes', 'Conteo de disfraces', NULL, NULL, 1, 'pendiente'),
      ('viernes', 'Desayuno por curso', NULL, NULL, 2, 'pendiente'),
      ('viernes', 'Caravana final', NULL, NULL, 3, 'pendiente'),
      ('viernes', 'Premiación de la alianza ganadora', NULL, NULL, 4, 'pendiente'),
      ('viernes', 'Coronación de los reyes', NULL, NULL, 5, 'pendiente'),
      ('viernes', 'Salida', NULL, '13:00', 6, 'pendiente');
  END IF;
END;
$$;

-- ============ ÍNDICES ============
CREATE INDEX IF NOT EXISTS idx_results_activity ON results(activity_id);
CREATE INDEX IF NOT EXISTS idx_results_alliance ON results(alliance_id);
CREATE INDEX IF NOT EXISTS idx_activities_day_order ON activities(day, order_index);
CREATE INDEX IF NOT EXISTS idx_change_log_created ON change_log(created_at DESC);

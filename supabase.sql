-- =========================================================
-- MEDICO A DOMICILIO — setup de base de datos
-- Copia y pega TODO este archivo en Supabase > SQL Editor > Run
-- =========================================================

-- Tabla principal de solicitudes de consulta
create table if not exists solicitudes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nombre text not null,
  telefono text not null,
  colonia text not null check (colonia in ('Polanco', 'Anzures')),
  calle text not null,
  numero text,
  referencias text,
  motivo text not null,
  horario_preferido text,
  status text not null default 'pendiente'
    check (status in ('pendiente', 'confirmado', 'en_camino', 'completado', 'cancelado')),
  notas_doctor text
);

-- Activar seguridad a nivel de fila (nadie puede leer/escribir salvo lo permitido abajo)
alter table solicitudes enable row level security;

-- Cualquier visitante (paciente) puede CREAR una solicitud desde la página pública
drop policy if exists "publico puede crear solicitudes" on solicitudes;
create policy "publico puede crear solicitudes"
  on solicitudes
  for insert
  to anon
  with check (true);

-- Solo tú (usuario autenticado en el panel) puedes VER las solicitudes
drop policy if exists "doctor puede ver solicitudes" on solicitudes;
create policy "doctor puede ver solicitudes"
  on solicitudes
  for select
  to authenticated
  using (true);

-- Solo tú puedes ACTUALIZAR el estatus / notas
drop policy if exists "doctor puede actualizar solicitudes" on solicitudes;
create policy "doctor puede actualizar solicitudes"
  on solicitudes
  for update
  to authenticated
  using (true)
  with check (true);

-- Índice para que el panel cargue rápido ordenado por fecha
create index if not exists solicitudes_created_at_idx on solicitudes (created_at desc);

-- ============================================================
-- Mi Armario — esquema para Supabase
-- Pégalo entero en: Supabase Dashboard -> SQL Editor -> Run
-- ============================================================

-- ---------- TABLA: prendas ----------
create table if not exists public.prendas (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  nombre     text not null check (char_length(nombre) between 1 and 60),
  categoria  text not null check (categoria in ('superior', 'inferior', 'abrigo', 'calzado', 'accesorio')),
  color      text,
  temporada  text check (temporada in ('primavera', 'verano', 'otoño', 'invierno', 'todo el año')),
  foto_url   text,
  creado_en  timestamptz not null default now()
);

create index if not exists prendas_user_idx on public.prendas (user_id, creado_en desc);

alter table public.prendas enable row level security;

drop policy if exists "prendas select propias" on public.prendas;
create policy "prendas select propias" on public.prendas
  for select using (auth.uid() = user_id);

drop policy if exists "prendas insert propias" on public.prendas;
create policy "prendas insert propias" on public.prendas
  for insert with check (auth.uid() = user_id);

drop policy if exists "prendas update propias" on public.prendas;
create policy "prendas update propias" on public.prendas
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "prendas delete propias" on public.prendas;
create policy "prendas delete propias" on public.prendas
  for delete using (auth.uid() = user_id);

-- ---------- TABLA: outfits ----------
create table if not exists public.outfits (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  nombre      text not null check (char_length(nombre) between 1 and 50),
  prenda_ids  uuid[] not null default '{}',
  creado_en   timestamptz not null default now()
);

create index if not exists outfits_user_idx on public.outfits (user_id, creado_en desc);

alter table public.outfits enable row level security;

drop policy if exists "outfits select propios" on public.outfits;
create policy "outfits select propios" on public.outfits
  for select using (auth.uid() = user_id);

drop policy if exists "outfits insert propios" on public.outfits;
create policy "outfits insert propios" on public.outfits
  for insert with check (auth.uid() = user_id);

drop policy if exists "outfits update propios" on public.outfits;
create policy "outfits update propios" on public.outfits
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "outfits delete propios" on public.outfits;
create policy "outfits delete propios" on public.outfits
  for delete using (auth.uid() = user_id);

-- ---------- STORAGE: bucket de fotos ----------
insert into storage.buckets (id, name, public)
values ('prendas', 'prendas', true)
on conflict (id) do nothing;

-- Lectura pública de las fotos (son solo ropa, sin datos sensibles)
drop policy if exists "fotos publicas" on storage.objects;
create policy "fotos publicas" on storage.objects
  for select using (bucket_id = 'prendas');

-- Cada usuario solo puede subir/borrar en su propia carpeta: {user_id}/archivo.jpg
drop policy if exists "subir fotos propias" on storage.objects;
create policy "subir fotos propias" on storage.objects
  for insert with check (
    bucket_id = 'prendas'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "borrar fotos propias" on storage.objects;
create policy "borrar fotos propias" on storage.objects
  for delete using (
    bucket_id = 'prendas'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz default now()
);

create table if not exists public.setlists (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  title text not null,
  is_public boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.setlist_items (
  id uuid primary key default gen_random_uuid(),
  setlist_id uuid references public.setlists(id) on delete cascade,
  position int not null,
  song_title text not null,
  show_date date,
  venue text,
  city text,
  source_item_id text,
  track_filename text,
  track_title text,
  duration_seconds int,
  segue boolean default false,
  notes text
);
create index if not exists setlist_items_idx on public.setlist_items (setlist_id, position);

create table if not exists public.favorites (
  user_id uuid references auth.users(id) on delete cascade,
  setlist_id uuid references public.setlists(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, setlist_id)
);

create table if not exists public.setlist_collaborators (
  setlist_id uuid references public.setlists(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text check (role in ('editor','viewer')) not null default 'editor',
  created_at timestamptz default now(),
  primary key (setlist_id, user_id)
);

alter table public.setlists enable row level security;
alter table public.setlist_items enable row level security;
alter table public.favorites enable row level security;
alter table public.setlist_collaborators enable row level security;

-- Public read for setlists if is_public, owner/collab otherwise
drop policy if exists "setlists public read" on public.setlists;
create policy "setlists public read" on public.setlists
  for select using (
    is_public or auth.uid() = owner_id or exists (
      select 1 from public.setlist_collaborators c
      where c.setlist_id = id and c.user_id = auth.uid()
    )
  );

drop policy if exists "setlists owner insert" on public.setlists;
create policy "setlists owner insert" on public.setlists
  for insert with check (auth.uid() = owner_id);
drop policy if exists "setlists owner update" on public.setlists;
create policy "setlists owner update" on public.setlists
  for update using (auth.uid() = owner_id);
drop policy if exists "setlists owner delete" on public.setlists;
create policy "setlists owner delete" on public.setlists
  for delete using (auth.uid() = owner_id);

-- Items follow parent permissions
drop policy if exists "items select" on public.setlist_items;
create policy "items select" on public.setlist_items
  for select using (true);

drop policy if exists "items insert permitted" on public.setlist_items;
create policy "items insert permitted" on public.setlist_items
  for insert with check (exists (
    select 1 from public.setlists s
    where s.id = setlist_id and (s.owner_id = auth.uid() or exists (
      select 1 from public.setlist_collaborators c where c.setlist_id = s.id and c.user_id = auth.uid()
    ))
  ));

drop policy if exists "items update permitted" on public.setlist_items;
create policy "items update permitted" on public.setlist_items
  for update using (exists (
    select 1 from public.setlists s
    where s.id = setlist_id and (s.owner_id = auth.uid() or exists (
      select 1 from public.setlist_collaborators c where c.setlist_id = s.id and c.user_id = auth.uid()
    ))
  ));

drop policy if exists "items delete permitted" on public.setlist_items;
create policy "items delete permitted" on public.setlist_items
  for delete using (exists (
    select 1 from public.setlists s
    where s.id = setlist_id and (s.owner_id = auth.uid() or exists (
      select 1 from public.setlist_collaborators c where c.setlist_id = s.id and c.user_id = auth.uid()
    ))
  ));

-- Favorites by self
drop policy if exists "favorites self" on public.favorites;
create policy "favorites self" on public.favorites
  for all using (auth.uid() = user_id);

-- Collaborators managed by owner
drop policy if exists "collaborators owner manage" on public.setlist_collaborators;
create policy "collaborators owner manage" on public.setlist_collaborators
  for all using (exists (
    select 1 from public.setlists s where s.id = setlist_id and s.owner_id = auth.uid()
  ));

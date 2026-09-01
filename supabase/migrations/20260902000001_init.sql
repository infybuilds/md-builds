-- InfyBuilds Markdown Hub — initial schema
-- Applied first; the RLS migration follows.

-- ---------------------------------------------------------------------------
-- Shared helpers
-- ---------------------------------------------------------------------------

-- Keeps updated_at honest: maintained by the database, never trusted from the client.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Slugs appear in public URLs, so constrain their shape at the lowest level.
-- Application-level zod validation mirrors this pattern.
create domain public.slug as text
  check (value ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(value) between 1 and 120);

-- ---------------------------------------------------------------------------
-- profiles — identifies administrators
-- ---------------------------------------------------------------------------

create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  role       text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Every auth user gets a profile with the non-privileged role. Admin is granted
-- out of band (see supabase/README.md) — never by the user themselves.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, coalesce(new.email, ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------

create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (length(trim(name)) > 0),
  slug        public.slug not null unique,
  description text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- workshops
-- ---------------------------------------------------------------------------

create table public.workshops (
  id          uuid primary key default gen_random_uuid(),
  title       text not null check (length(trim(title)) > 0),
  slug        public.slug not null unique,
  description text,
  published   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger workshops_set_updated_at
  before update on public.workshops
  for each row execute function public.set_updated_at();

create index workshops_published_idx on public.workshops (published);

-- ---------------------------------------------------------------------------
-- documents
-- ---------------------------------------------------------------------------

create table public.documents (
  id          uuid primary key default gen_random_uuid(),
  title       text not null check (length(trim(title)) > 0),
  slug        public.slug not null unique,
  description text,
  content     text not null default '',
  category_id uuid references public.categories (id) on delete set null,
  workshop_id uuid references public.workshops (id) on delete set null,
  published   boolean not null default false,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger documents_set_updated_at
  before update on public.documents
  for each row execute function public.set_updated_at();

create index documents_published_idx on public.documents (published);
create index documents_category_idx  on public.documents (category_id);
-- Serves lesson listings and previous/next lookups in one index.
create index documents_workshop_order_idx on public.documents (workshop_id, sort_order);

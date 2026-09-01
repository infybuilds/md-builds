-- InfyBuilds Markdown Hub — Row Level Security
-- Applied after the initial schema migration.
--
-- Authorization lives here, not only in the Next.js app. Even with a valid
-- session cookie and the anon key, Postgres refuses writes from non-admins and
-- refuses reads of unpublished content.

alter table public.profiles   enable row level security;
alter table public.categories enable row level security;
alter table public.workshops  enable row level security;
alter table public.documents  enable row level security;

-- ---------------------------------------------------------------------------
-- Admin predicate
-- ---------------------------------------------------------------------------

-- security definer so the lookup does not re-enter profiles' own RLS policies
-- (which would recurse). Reads nothing but the caller's own role.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- profiles — never public
-- ---------------------------------------------------------------------------

create policy "profiles: read own" on public.profiles
  for select to authenticated
  using (id = auth.uid());

create policy "profiles: admins read all" on public.profiles
  for select to authenticated
  using (public.is_admin());

-- Deliberately no insert/update/delete policies: rows are created by the
-- on_auth_user_created trigger, and `role` can only be changed from the
-- Supabase SQL editor. This is what stops a user granting themselves admin.

-- ---------------------------------------------------------------------------
-- documents
-- ---------------------------------------------------------------------------

create policy "documents: public reads published" on public.documents
  for select to anon, authenticated
  using (published = true);

create policy "documents: admins read all" on public.documents
  for select to authenticated
  using (public.is_admin());

create policy "documents: admins insert" on public.documents
  for insert to authenticated
  with check (public.is_admin());

create policy "documents: admins update" on public.documents
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "documents: admins delete" on public.documents
  for delete to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- workshops
-- ---------------------------------------------------------------------------

create policy "workshops: public reads published" on public.workshops
  for select to anon, authenticated
  using (published = true);

create policy "workshops: admins read all" on public.workshops
  for select to authenticated
  using (public.is_admin());

create policy "workshops: admins insert" on public.workshops
  for insert to authenticated
  with check (public.is_admin());

create policy "workshops: admins update" on public.workshops
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "workshops: admins delete" on public.workshops
  for delete to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------

-- "categories associated with public content": a category is visible publicly
-- only once it holds at least one published document. Empty and draft-only
-- categories stay hidden from the public site.
create policy "categories: public reads categories with published docs" on public.categories
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.documents d
      where d.category_id = categories.id and d.published = true
    )
  );

create policy "categories: admins read all" on public.categories
  for select to authenticated
  using (public.is_admin());

create policy "categories: admins insert" on public.categories
  for insert to authenticated
  with check (public.is_admin());

create policy "categories: admins update" on public.categories
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "categories: admins delete" on public.categories
  for delete to authenticated
  using (public.is_admin());

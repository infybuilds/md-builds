-- Locked lessons: visible in listings, body withheld until released.
--
-- The requirement is that a locked lesson's body is genuinely unreadable, not
-- merely hidden in the UI. A CSS blur would not do it: `content` was readable
-- straight from the REST API with the publishable key that ships in every page.
--
-- RLS is row-level and cannot hide a single column conditionally, so instead the
-- column is made unreadable to everyone and served only through functions that
-- enforce the rules.
--
-- This migration is additive only, so it is safe to apply while the previous
-- build is still serving. The REVOKE that actually closes direct access lives in
-- 20260902000004, to be applied AFTER the new code is deployed — otherwise the
-- running build's `select(*)` would start failing on the content column.

alter table public.documents
  add column locked boolean not null default false;

comment on column public.documents.locked is
  'When true the body is withheld from readers; title and description stay visible.';

-- Public read path: the body only comes back for a published, unlocked document.
-- Admins get it regardless, so the editor and preview keep working.
create or replace function public.document_content(p_slug text)
returns text
language sql
security definer
stable
set search_path = public
as $$
  select d.content
  from public.documents d
  where d.slug = p_slug
    and (
      public.is_admin()
      or (d.published = true and d.locked = false)
    );
$$;

-- Admin read path, by id, for the editor.
create or replace function public.admin_document_content(p_id uuid)
returns text
language sql
security definer
stable
set search_path = public
as $$
  select d.content
  from public.documents d
  where d.id = p_id
    and public.is_admin();
$$;

create index documents_locked_idx on public.documents (locked);

-- Reverts 20260902000004.
--
-- That REVOKE did not do what it was meant to, and broke reading instead:
-- every lesson started rendering as locked because public.document_content
-- returned null even for published, unlocked documents. It also failed at its
-- actual purpose — anon could still select `content` directly, because a
-- table-level SELECT grant (which Supabase applies by default) already covers
-- every column, so revoking one column's privilege changes nothing.
--
-- Restricting a single column requires revoking table-level SELECT and then
-- granting the remaining columns explicitly. Reverted here first so the site
-- works; the correct form can be applied deliberately afterwards.

grant select (content) on public.documents to anon, authenticated;

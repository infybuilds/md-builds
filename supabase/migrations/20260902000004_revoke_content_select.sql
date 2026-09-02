-- Closes direct access to `documents.content`.
--
-- Apply this only AFTER the build that reads bodies through
-- public.document_content / public.admin_document_content is deployed. Until
-- then the running code still selects the column directly and would break.
--
-- Writes are unaffected: column privileges for INSERT and UPDATE are separate
-- from SELECT, so the admin editor keeps saving normally.

revoke select (content) on public.documents from anon, authenticated;

-- Enable Row-Level Security on the tables added since RLS was last enabled.
--
-- The app only reaches the database through Prisma, which connects as the
-- table-owning `postgres` role and therefore bypasses RLS. No policies are
-- defined on purpose: this denies all access via Supabase's auto-generated
-- REST API (anon / authenticated roles), which is the exposure Supabase flagged.
ALTER TABLE "Accolade" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PlayHistory" ENABLE ROW LEVEL SECURITY;

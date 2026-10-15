-- Enable Row-Level Security on every public table.
--
-- The app only reaches the database through Prisma, which connects as the
-- table-owning `postgres` role and therefore bypasses RLS. No policies are
-- defined on purpose: this denies all access via Supabase's auto-generated
-- REST API (anon / authenticated roles), which is the exposure Supabase flagged.
ALTER TABLE "Play" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Accolade" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PlayHistory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Production" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProductionPhoto" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;

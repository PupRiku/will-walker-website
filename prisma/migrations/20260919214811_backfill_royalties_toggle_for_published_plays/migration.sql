-- Backfill: the prior migration defaulted showRoyaltiesButton to true for
-- every existing row, including already-published plays. That contradicts
-- the invariant that a published play never shows the royalties button
-- (see normalizeShowRoyaltiesButton in src/utils/royalties.ts) and leaves
-- stale data in GET /api/plays until each play happens to be re-saved.
UPDATE "Play" SET "showRoyaltiesButton" = false WHERE "published" = true;

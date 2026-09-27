-- Generalize Bill to support multiple public data sources (OpenStates + LegiScan).
-- The Bill table has no rows yet, so replacing the source-id columns is safe.
DROP INDEX IF EXISTS "Bill_openstatesId_key";
ALTER TABLE "Bill" DROP COLUMN IF EXISTS "openstatesId";
ALTER TABLE "Bill" DROP COLUMN IF EXISTS "openstatesUrl";
ALTER TABLE "Bill" ADD COLUMN "source" TEXT NOT NULL DEFAULT 'openstates';
ALTER TABLE "Bill" ADD COLUMN "externalId" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Bill" ADD COLUMN "sourceUrl" TEXT;
ALTER TABLE "Bill" ALTER COLUMN "externalId" DROP DEFAULT;
CREATE UNIQUE INDEX "Bill_externalId_key" ON "Bill"("externalId");

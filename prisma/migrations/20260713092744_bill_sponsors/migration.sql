-- CreateTable
CREATE TABLE "BillSponsor" (
    "id" TEXT NOT NULL,
    "billId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameKey" TEXT NOT NULL,
    "role" TEXT,
    "primary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "BillSponsor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BillSponsor_nameKey_idx" ON "BillSponsor"("nameKey");

-- CreateIndex
CREATE INDEX "BillSponsor_billId_idx" ON "BillSponsor"("billId");

-- AddForeignKey
ALTER TABLE "BillSponsor" ADD CONSTRAINT "BillSponsor_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

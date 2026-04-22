-- AlterTable
ALTER TABLE "ProductionPhoto" ADD COLUMN     "productionId" TEXT;

-- CreateTable
CREATE TABLE "Production" (
    "id" TEXT NOT NULL,
    "playTitle" TEXT NOT NULL,
    "venue" TEXT NOT NULL,
    "productionYear" INTEGER NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Production_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Production_playTitle_venue_productionYear_key" ON "Production"("playTitle", "venue", "productionYear");

-- AddForeignKey
ALTER TABLE "ProductionPhoto" ADD CONSTRAINT "ProductionPhoto_productionId_fkey" FOREIGN KEY ("productionId") REFERENCES "Production"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "Accolade" (
    "id" TEXT NOT NULL,
    "playId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Accolade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Accolade_playId_idx" ON "Accolade"("playId");

-- AddForeignKey
ALTER TABLE "Accolade" ADD CONSTRAINT "Accolade_playId_fkey" FOREIGN KEY ("playId") REFERENCES "Play"("id") ON DELETE CASCADE ON UPDATE CASCADE;

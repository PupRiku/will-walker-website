-- AlterTable
ALTER TABLE "Play" ADD COLUMN     "bannerText" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "bannerColor" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "showRoyaltiesButton" BOOLEAN NOT NULL DEFAULT true;

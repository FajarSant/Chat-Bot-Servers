/*
  Warnings:

  - You are about to drop the column `tanggal` on the `Materi` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Materi" DROP COLUMN "tanggal",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

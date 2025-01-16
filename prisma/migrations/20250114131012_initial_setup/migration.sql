/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Materi` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Materi" DROP COLUMN "createdAt",
ALTER COLUMN "tanggal" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "Materi" (
    "id" SERIAL NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Materi_pkey" PRIMARY KEY ("id")
);

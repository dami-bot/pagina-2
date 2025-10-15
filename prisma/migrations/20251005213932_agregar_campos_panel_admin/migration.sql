-- AlterTable
ALTER TABLE "Producto" ADD COLUMN     "ofertaDiaria" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "vencimiento" TIMESTAMP(3);

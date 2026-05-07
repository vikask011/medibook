-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "documents" TEXT[] DEFAULT ARRAY[]::TEXT[];

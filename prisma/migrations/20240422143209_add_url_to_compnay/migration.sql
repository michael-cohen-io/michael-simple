/*
  Warnings:

  - You are about to drop the column `url` on the `WorkEntry` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "url" TEXT;

-- AlterTable
ALTER TABLE "WorkEntry" DROP COLUMN "url";

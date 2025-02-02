/*
  Warnings:

  - You are about to drop the `_SharedNotebooks` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_SharedNotebooks" DROP CONSTRAINT "_SharedNotebooks_A_fkey";

-- DropForeignKey
ALTER TABLE "_SharedNotebooks" DROP CONSTRAINT "_SharedNotebooks_B_fkey";

-- DropTable
DROP TABLE "_SharedNotebooks";

/*
  Warnings:

  - You are about to alter the column `percentage` on the `Discount` table. The data in that column could be lost. The data in that column will be cast from `Decimal(3,2)` to `Decimal(5,2)`.

*/
-- AlterTable
ALTER TABLE `Discount` MODIFY `percentage` DECIMAL(5, 2) NOT NULL;

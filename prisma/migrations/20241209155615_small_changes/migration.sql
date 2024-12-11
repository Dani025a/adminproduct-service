/*
  Warnings:

  - You are about to drop the `_ProductToProductFilter` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `categoryFilterOptionId` on table `CategoryFilterOptionCategory` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `productId` to the `ProductFilter` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `CategoryFilterOptionCategory` DROP FOREIGN KEY `CategoryFilterOptionCategory_categoryFilterOptionId_fkey`;

-- DropForeignKey
ALTER TABLE `_ProductToProductFilter` DROP FOREIGN KEY `_ProductToProductFilter_A_fkey`;

-- DropForeignKey
ALTER TABLE `_ProductToProductFilter` DROP FOREIGN KEY `_ProductToProductFilter_B_fkey`;

-- AlterTable
ALTER TABLE `CategoryFilterOptionCategory` MODIFY `categoryFilterOptionId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `ProductFilter` ADD COLUMN `productId` INTEGER NOT NULL;

-- DropTable
DROP TABLE `_ProductToProductFilter`;

-- AddForeignKey
ALTER TABLE `ProductFilter` ADD CONSTRAINT `ProductFilter_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CategoryFilterOptionCategory` ADD CONSTRAINT `CategoryFilterOptionCategory_categoryFilterOptionId_fkey` FOREIGN KEY (`categoryFilterOptionId`) REFERENCES `CategoryFilterOption`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the column `backgroundColor` on the `shop` table. All the data in the column will be lost.
  - Added the required column `price` to the `Shop` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `shop` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX `Product_userId_fkey` ON `product`;

-- AlterTable
ALTER TABLE `product` ADD COLUMN `shopId` INTEGER NULL;

-- AlterTable
ALTER TABLE `shop` DROP COLUMN `backgroundColor`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `price` DOUBLE NOT NULL,
    MODIFY `description` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_shopId_fkey` FOREIGN KEY (`shopId`) REFERENCES `Shop`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Shop` ADD CONSTRAINT `Shop_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

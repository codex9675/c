/*
  Warnings:

  - You are about to drop the column `createdAt` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `passwordExpires` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `profileLink` on the `user` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Product_userId_fkey` ON `product`;

-- DropIndex
DROP INDEX `User_profileLink_idx` ON `user`;

-- DropIndex
DROP INDEX `User_profileLink_key` ON `user`;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `createdAt`,
    DROP COLUMN `passwordExpires`,
    DROP COLUMN `profileLink`,
    ADD COLUMN `packageType` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

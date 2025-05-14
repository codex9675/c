/*
  Warnings:

  - A unique constraint covering the columns `[profileLink]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Made the column `passwordExpires` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX `Product_userId_fkey` ON `product`;

-- AlterTable
ALTER TABLE `user` MODIFY `passwordExpires` DATETIME(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_profileLink_key` ON `User`(`profileLink`);

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

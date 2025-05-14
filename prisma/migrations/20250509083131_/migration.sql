/*
  Warnings:

  - The values [ADVANCED] on the enum `users_plan` will be removed. If these variants are still used in the database, this will fail.

*/
-- DropIndex
DROP INDEX `Product_userId_fkey` ON `product`;

-- AlterTable
ALTER TABLE `users` MODIFY `plan` ENUM('BASIC', 'PROFESSIONAL', 'ENTERPRISE') NOT NULL DEFAULT 'BASIC';

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - The values [PROFESSIONAL,ENTERPRISE] on the enum `users_plan` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `products` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE `users` MODIFY `plan` ENUM('BASIC', 'ADVANCED') NOT NULL DEFAULT 'BASIC';

-- DropTable
DROP TABLE `products`;

-- CreateTable
CREATE TABLE `Product` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL,
    `image` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

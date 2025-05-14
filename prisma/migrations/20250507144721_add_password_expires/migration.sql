-- DropIndex
DROP INDEX `Product_userId_fkey` ON `product`;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `passwordExpires` DATETIME(3) NULL,
    ADD COLUMN `profileLink` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

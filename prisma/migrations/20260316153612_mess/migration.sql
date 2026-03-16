/*
  Warnings:

  - You are about to drop the column `cityBuilding` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `customerEmail` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `customerName` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `customerPhone` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `flatRoomNo` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `mealLocations` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `serviceStartDate` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `whatsappNo` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the `OrderItem` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `customerId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `selectionsJson` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_orderId_fkey";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "cityBuilding",
DROP COLUMN "customerEmail",
DROP COLUMN "customerName",
DROP COLUMN "customerPhone",
DROP COLUMN "flatRoomNo",
DROP COLUMN "mealLocations",
DROP COLUMN "serviceStartDate",
DROP COLUMN "whatsappNo",
ADD COLUMN     "activeDates" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "brunchLunchLocation" TEXT,
ADD COLUMN     "buildingName" TEXT,
ADD COLUMN     "customerId" TEXT NOT NULL,
ADD COLUMN     "dinnerLocation" TEXT,
ADD COLUMN     "flatRoomNumber" TEXT,
ADD COLUMN     "includeSundays" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "orderRemarks" TEXT,
ADD COLUMN     "paymentReceiptUrl" TEXT,
ADD COLUMN     "paymentRemarks" TEXT,
ADD COLUMN     "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "selectionsJson" JSONB NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "sundaysCount" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "OrderItem";

-- CreateTable
CREATE TABLE "Setting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "whatsappNo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "password" TEXT,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_OrderToFoodMenu" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Setting_key_key" ON "Setting"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_phone_key" ON "Customer"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_OrderToFoodMenu_AB_unique" ON "_OrderToFoodMenu"("A", "B");

-- CreateIndex
CREATE INDEX "_OrderToFoodMenu_B_index" ON "_OrderToFoodMenu"("B");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrderToFoodMenu" ADD CONSTRAINT "_OrderToFoodMenu_A_fkey" FOREIGN KEY ("A") REFERENCES "FoodMenu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrderToFoodMenu" ADD CONSTRAINT "_OrderToFoodMenu_B_fkey" FOREIGN KEY ("B") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

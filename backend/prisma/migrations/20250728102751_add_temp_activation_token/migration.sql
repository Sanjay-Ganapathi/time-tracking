/*
  Warnings:

  - A unique constraint covering the columns `[activationToken]` on the table `Employee` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Employee" ADD COLUMN "activationToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Employee_activationToken_key" ON "Employee"("activationToken");

-- CreateEnum
CREATE TYPE "AdminProcurementStatus" AS ENUM ('PENDING', 'ORDERED', 'DELIVERED', 'CANCELLED');

-- CreateTable
CREATE TABLE "admin_procurement_items" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "itemName" VARCHAR(200) NOT NULL,
    "vendorName" VARCHAR(200),
    "quantity" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "unit" VARCHAR(50) NOT NULL DEFAULT 'pcs',
    "unitPrice" DECIMAL(12,2),
    "poNumber" VARCHAR(100),
    "deliveryDate" DATE,
    "status" "AdminProcurementStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdBy" VARCHAR(50),
    "updatedBy" VARCHAR(50),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_procurement_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "admin_procurement_items_organizationId_status_idx" ON "admin_procurement_items"("organizationId", "status");

-- AddForeignKey
ALTER TABLE "admin_procurement_items" ADD CONSTRAINT "admin_procurement_items_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

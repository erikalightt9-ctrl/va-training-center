-- CreateEnum
CREATE TYPE "ItAssetStatus" AS ENUM ('AVAILABLE', 'ASSIGNED', 'IN_REPAIR', 'FOR_DISPOSAL', 'RETIRED');

-- CreateEnum
CREATE TYPE "ItAssetCondition" AS ENUM ('NEW', 'GOOD', 'FAIR', 'POOR');

-- CreateEnum
CREATE TYPE "ItMaintenanceStatus" AS ENUM ('PENDING', 'ONGOING', 'RESOLVED');

-- CreateTable
CREATE TABLE "it_asset_categories" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "depreciationYears" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "it_asset_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "it_assets" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "assetTag" TEXT NOT NULL,
    "assetName" TEXT NOT NULL,
    "categoryId" TEXT,
    "brand" TEXT,
    "model" TEXT,
    "serialNumber" TEXT,
    "specs" JSONB,
    "purchaseDate" TIMESTAMP(3),
    "purchaseCost" DECIMAL(12,2),
    "supplier" TEXT,
    "warrantyStart" TIMESTAMP(3),
    "warrantyEnd" TIMESTAMP(3),
    "status" "ItAssetStatus" NOT NULL DEFAULT 'AVAILABLE',
    "condition" "ItAssetCondition" NOT NULL DEFAULT 'NEW',
    "assignedToId" TEXT,
    "assignedDate" TIMESTAMP(3),
    "location" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "it_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "it_asset_history_logs" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "previousStatus" TEXT,
    "newStatus" TEXT,
    "assignedToId" TEXT,
    "performedById" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "it_asset_history_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "it_maintenance_records" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "issueDescription" TEXT NOT NULL,
    "reportedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedDate" TIMESTAMP(3),
    "status" "ItMaintenanceStatus" NOT NULL DEFAULT 'PENDING',
    "cost" DECIMAL(12,2),
    "vendor" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "it_maintenance_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "it_asset_categories_organizationId_name_key" ON "it_asset_categories"("organizationId", "name");
CREATE INDEX "it_asset_categories_organizationId_idx" ON "it_asset_categories"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "it_assets_assetTag_key" ON "it_assets"("assetTag");
CREATE INDEX "it_assets_organizationId_idx" ON "it_assets"("organizationId");
CREATE INDEX "it_assets_organizationId_status_idx" ON "it_assets"("organizationId", "status");
CREATE INDEX "it_assets_assignedToId_idx" ON "it_assets"("assignedToId");

-- CreateIndex
CREATE INDEX "it_asset_history_logs_assetId_idx" ON "it_asset_history_logs"("assetId");

-- CreateIndex
CREATE INDEX "it_maintenance_records_assetId_idx" ON "it_maintenance_records"("assetId");

-- AddForeignKey
ALTER TABLE "it_asset_categories" ADD CONSTRAINT "it_asset_categories_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "it_assets" ADD CONSTRAINT "it_assets_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "it_assets" ADD CONSTRAINT "it_assets_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "it_asset_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "it_assets" ADD CONSTRAINT "it_assets_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "hr_employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "it_asset_history_logs" ADD CONSTRAINT "it_asset_history_logs_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "it_assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "it_asset_history_logs" ADD CONSTRAINT "it_asset_history_logs_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "hr_employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "it_asset_history_logs" ADD CONSTRAINT "it_asset_history_logs_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "hr_employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "it_maintenance_records" ADD CONSTRAINT "it_maintenance_records_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "it_assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

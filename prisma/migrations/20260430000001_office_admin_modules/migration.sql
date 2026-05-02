-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "OfficeRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "OfficeRequestPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "DeliveryStatus" AS ENUM ('SCHEDULED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- CreateTable: AdminOfficeRequest
CREATE TABLE IF NOT EXISTS "admin_office_requests" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "category" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "priority" "OfficeRequestPriority" NOT NULL DEFAULT 'NORMAL',
    "status" "OfficeRequestStatus" NOT NULL DEFAULT 'PENDING',
    "requestedBy" VARCHAR(200) NOT NULL,
    "department" VARCHAR(150),
    "approvedBy" VARCHAR(200),
    "approvedAt" TIMESTAMP(3),
    "rejectedBy" VARCHAR(200),
    "rejectedAt" TIMESTAMP(3),
    "rejectionNote" TEXT,
    "completedBy" VARCHAR(200),
    "completedAt" TIMESTAMP(3),
    "completionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "admin_office_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable: AdminVehicle
CREATE TABLE IF NOT EXISTS "admin_vehicles" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "plateNumber" VARCHAR(50) NOT NULL,
    "vehicleType" VARCHAR(100) NOT NULL,
    "driver" VARCHAR(150),
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "admin_vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable: AdminDelivery
CREATE TABLE IF NOT EXISTS "admin_deliveries" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "vehicleId" TEXT,
    "title" VARCHAR(200) NOT NULL,
    "origin" VARCHAR(300) NOT NULL,
    "destination" VARCHAR(300) NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "deliveredAt" TIMESTAMP(3),
    "driver" VARCHAR(150),
    "status" "DeliveryStatus" NOT NULL DEFAULT 'SCHEDULED',
    "cargo" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "admin_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable: AdminBudgetCategory
CREATE TABLE IF NOT EXISTS "admin_budget_categories" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "monthlyBudget" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "yearlyBudget" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "color" VARCHAR(20),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "admin_budget_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable: AdminBudgetEntry
CREATE TABLE IF NOT EXISTS "admin_budget_entries" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "description" VARCHAR(300) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "entryDate" DATE NOT NULL,
    "reference" VARCHAR(100),
    "source" VARCHAR(30) NOT NULL DEFAULT 'MANUAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "admin_budget_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "admin_office_requests_organizationId_status_idx" ON "admin_office_requests"("organizationId", "status");
CREATE INDEX IF NOT EXISTS "admin_office_requests_organizationId_createdAt_idx" ON "admin_office_requests"("organizationId", "createdAt");
CREATE INDEX IF NOT EXISTS "admin_vehicles_organizationId_idx" ON "admin_vehicles"("organizationId");
CREATE INDEX IF NOT EXISTS "admin_deliveries_organizationId_status_idx" ON "admin_deliveries"("organizationId", "status");
CREATE INDEX IF NOT EXISTS "admin_deliveries_organizationId_scheduledAt_idx" ON "admin_deliveries"("organizationId", "scheduledAt");
CREATE INDEX IF NOT EXISTS "admin_budget_categories_organizationId_idx" ON "admin_budget_categories"("organizationId");
CREATE UNIQUE INDEX IF NOT EXISTS "admin_budget_categories_organizationId_name_key" ON "admin_budget_categories"("organizationId", "name");
CREATE INDEX IF NOT EXISTS "admin_budget_entries_organizationId_categoryId_idx" ON "admin_budget_entries"("organizationId", "categoryId");
CREATE INDEX IF NOT EXISTS "admin_budget_entries_organizationId_entryDate_idx" ON "admin_budget_entries"("organizationId", "entryDate");

-- AddForeignKey
ALTER TABLE "admin_office_requests" DROP CONSTRAINT IF EXISTS "admin_office_requests_organizationId_fkey";
ALTER TABLE "admin_office_requests" ADD CONSTRAINT "admin_office_requests_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "admin_vehicles" DROP CONSTRAINT IF EXISTS "admin_vehicles_organizationId_fkey";
ALTER TABLE "admin_vehicles" ADD CONSTRAINT "admin_vehicles_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "admin_deliveries" DROP CONSTRAINT IF EXISTS "admin_deliveries_organizationId_fkey";
ALTER TABLE "admin_deliveries" ADD CONSTRAINT "admin_deliveries_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "admin_deliveries" DROP CONSTRAINT IF EXISTS "admin_deliveries_vehicleId_fkey";
ALTER TABLE "admin_deliveries" ADD CONSTRAINT "admin_deliveries_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "admin_vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "admin_budget_categories" DROP CONSTRAINT IF EXISTS "admin_budget_categories_organizationId_fkey";
ALTER TABLE "admin_budget_categories" ADD CONSTRAINT "admin_budget_categories_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "admin_budget_entries" DROP CONSTRAINT IF EXISTS "admin_budget_entries_organizationId_fkey";
ALTER TABLE "admin_budget_entries" ADD CONSTRAINT "admin_budget_entries_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "admin_budget_entries" DROP CONSTRAINT IF EXISTS "admin_budget_entries_categoryId_fkey";
ALTER TABLE "admin_budget_entries" ADD CONSTRAINT "admin_budget_entries_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "admin_budget_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

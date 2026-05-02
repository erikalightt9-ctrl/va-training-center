-- AdminVehicleStatus enum
DO $$ BEGIN CREATE TYPE "AdminVehicleStatus" AS ENUM ('ACTIVE','MAINTENANCE','RETIRED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
-- AdminDeliveryStatus enum
DO $$ BEGIN CREATE TYPE "AdminDeliveryStatus" AS ENUM ('SCHEDULED','IN_TRANSIT','DELIVERED','CANCELLED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
-- AdminRequestStatus enum
DO $$ BEGIN CREATE TYPE "AdminRequestStatus" AS ENUM ('PENDING','APPROVED','COMPLETED','REJECTED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
-- AdminRequestPriority enum
DO $$ BEGIN CREATE TYPE "AdminRequestPriority" AS ENUM ('LOW','NORMAL','HIGH','URGENT'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "admin_vehicles" (
  "id" TEXT NOT NULL,"organizationId" TEXT NOT NULL,"name" VARCHAR(200) NOT NULL,
  "plateNumber" VARCHAR(50),"vehicleType" VARCHAR(100) NOT NULL DEFAULT 'Van',
  "driver" VARCHAR(200),"status" "AdminVehicleStatus" NOT NULL DEFAULT 'ACTIVE',
  "notes" TEXT,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "admin_vehicles_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "admin_vehicles_organizationId_status_idx" ON "admin_vehicles"("organizationId","status");
DO $$ BEGIN ALTER TABLE "admin_vehicles" ADD CONSTRAINT "admin_vehicles_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "admin_deliveries" (
  "id" TEXT NOT NULL,"organizationId" TEXT NOT NULL,"vehicleId" TEXT,
  "origin" VARCHAR(300) NOT NULL,"destination" VARCHAR(300) NOT NULL,
  "scheduledAt" TIMESTAMP(3) NOT NULL,"cargo" TEXT,
  "status" "AdminDeliveryStatus" NOT NULL DEFAULT 'SCHEDULED',
  "notes" TEXT,"createdBy" VARCHAR(50),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "admin_deliveries_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "admin_deliveries_organizationId_status_idx" ON "admin_deliveries"("organizationId","status");
CREATE INDEX IF NOT EXISTS "admin_deliveries_organizationId_scheduledAt_idx" ON "admin_deliveries"("organizationId","scheduledAt");
DO $$ BEGIN ALTER TABLE "admin_deliveries" ADD CONSTRAINT "admin_deliveries_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "admin_deliveries" ADD CONSTRAINT "admin_deliveries_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "admin_vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "admin_office_requests" (
  "id" TEXT NOT NULL,"organizationId" TEXT NOT NULL,"title" VARCHAR(300) NOT NULL,
  "category" VARCHAR(100) NOT NULL DEFAULT 'Supplies',
  "priority" "AdminRequestPriority" NOT NULL DEFAULT 'NORMAL',
  "description" TEXT,"status" "AdminRequestStatus" NOT NULL DEFAULT 'PENDING',
  "requestedBy" VARCHAR(200),"approvedBy" VARCHAR(200),
  "rejectionReason" TEXT,"completionNote" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "admin_office_requests_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "admin_office_requests_organizationId_status_idx" ON "admin_office_requests"("organizationId","status");
CREATE INDEX IF NOT EXISTS "admin_office_requests_organizationId_priority_idx" ON "admin_office_requests"("organizationId","priority");
DO $$ BEGIN ALTER TABLE "admin_office_requests" ADD CONSTRAINT "admin_office_requests_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "admin_budget_categories" (
  "id" TEXT NOT NULL,"organizationId" TEXT NOT NULL,"name" VARCHAR(200) NOT NULL,
  "monthlyBudget" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "yearlyBudget" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "color" VARCHAR(20) NOT NULL DEFAULT '#6366f1',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "admin_budget_categories_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "admin_budget_categories_organizationId_idx" ON "admin_budget_categories"("organizationId");
DO $$ BEGIN ALTER TABLE "admin_budget_categories" ADD CONSTRAINT "admin_budget_categories_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "admin_budget_entries" (
  "id" TEXT NOT NULL,"categoryId" TEXT NOT NULL,"description" VARCHAR(300) NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,"entryDate" DATE NOT NULL,
  "reference" VARCHAR(100),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "admin_budget_entries_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "admin_budget_entries_categoryId_entryDate_idx" ON "admin_budget_entries"("categoryId","entryDate");
DO $$ BEGIN ALTER TABLE "admin_budget_entries" ADD CONSTRAINT "admin_budget_entries_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "admin_budget_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

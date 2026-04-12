-- Admin Department enums
CREATE TYPE "AdminAssetType" AS ENUM ('FURNITURE', 'APPLIANCE', 'MACHINE', 'EQUIPMENT', 'VEHICLE', 'OTHER');
CREATE TYPE "AdminAssetStatus" AS ENUM ('ACTIVE', 'FOR_REPAIR', 'IN_REPAIR', 'FOR_DISPOSE', 'DISPOSED', 'UNDER_WARRANTY');
CREATE TYPE "AdminRepairStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE "AdminSupplierStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- Assets (furniture, appliances, machines, equipment, vehicles)
CREATE TABLE IF NOT EXISTS "admin_assets" (
  "id"             TEXT         NOT NULL,
  "organizationId" TEXT         NOT NULL,
  "name"           VARCHAR(200) NOT NULL,
  "assetTag"       VARCHAR(50),
  "assetType"      "AdminAssetType"   NOT NULL DEFAULT 'EQUIPMENT',
  "status"         "AdminAssetStatus" NOT NULL DEFAULT 'ACTIVE',
  "location"       VARCHAR(200),
  "purchaseDate"   DATE,
  "purchaseValue"  DECIMAL(12,2),
  "warrantyExpiry" DATE,
  "serialNumber"   VARCHAR(100),
  "notes"          TEXT,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "admin_assets_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "admin_assets_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "admin_assets_organizationId_assetType_idx" ON "admin_assets"("organizationId","assetType");
CREATE INDEX IF NOT EXISTS "admin_assets_organizationId_status_idx"    ON "admin_assets"("organizationId","status");

-- Car maintenance logs
CREATE TABLE IF NOT EXISTS "admin_car_maintenance" (
  "id"              TEXT         NOT NULL,
  "organizationId"  TEXT         NOT NULL,
  "vehicleInfo"     VARCHAR(200) NOT NULL,
  "date"            DATE         NOT NULL,
  "maintenanceType" VARCHAR(100) NOT NULL,
  "description"     TEXT,
  "cost"            DECIMAL(10,2),
  "odometer"        INTEGER,
  "shop"            VARCHAR(200),
  "nextServiceDate" DATE,
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "admin_car_maintenance_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "admin_car_maintenance_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "admin_car_maintenance_organizationId_date_idx" ON "admin_car_maintenance"("organizationId","date");

-- Fuel logs
CREATE TABLE IF NOT EXISTS "admin_fuel_logs" (
  "id"             TEXT         NOT NULL,
  "organizationId" TEXT         NOT NULL,
  "vehicleInfo"    VARCHAR(200) NOT NULL,
  "date"           DATE         NOT NULL,
  "liters"         DECIMAL(6,2) NOT NULL,
  "pricePerLiter"  DECIMAL(8,2),
  "totalCost"      DECIMAL(10,2),
  "odometer"       INTEGER,
  "driver"         VARCHAR(150),
  "station"        VARCHAR(200),
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "admin_fuel_logs_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "admin_fuel_logs_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "admin_fuel_logs_organizationId_date_idx" ON "admin_fuel_logs"("organizationId","date");

-- Pantry inventory
CREATE TABLE IF NOT EXISTS "admin_pantry_items" (
  "id"             TEXT         NOT NULL,
  "organizationId" TEXT         NOT NULL,
  "name"           VARCHAR(200) NOT NULL,
  "category"       VARCHAR(100),
  "quantity"       DECIMAL(10,2) NOT NULL DEFAULT 0,
  "unit"           VARCHAR(50)   NOT NULL DEFAULT 'pcs',
  "reorderLevel"   DECIMAL(10,2) NOT NULL DEFAULT 0,
  "supplier"       VARCHAR(200),
  "notes"          TEXT,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "admin_pantry_items_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "admin_pantry_items_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "admin_pantry_items_organizationId_idx" ON "admin_pantry_items"("organizationId");

-- Maintenance supplies inventory
CREATE TABLE IF NOT EXISTS "admin_maintenance_items" (
  "id"             TEXT         NOT NULL,
  "organizationId" TEXT         NOT NULL,
  "name"           VARCHAR(200) NOT NULL,
  "category"       VARCHAR(100),
  "quantity"       DECIMAL(10,2) NOT NULL DEFAULT 0,
  "unit"           VARCHAR(50)   NOT NULL DEFAULT 'pcs',
  "reorderLevel"   DECIMAL(10,2) NOT NULL DEFAULT 0,
  "location"       VARCHAR(200),
  "supplier"       VARCHAR(200),
  "notes"          TEXT,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "admin_maintenance_items_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "admin_maintenance_items_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "admin_maintenance_items_organizationId_idx" ON "admin_maintenance_items"("organizationId");

-- Repair logs
CREATE TABLE IF NOT EXISTS "admin_repair_logs" (
  "id"             TEXT                NOT NULL,
  "organizationId" TEXT                NOT NULL,
  "itemName"       VARCHAR(200)        NOT NULL,
  "itemType"       VARCHAR(100),
  "dateReported"   DATE                NOT NULL,
  "dateResolved"   DATE,
  "description"    TEXT                NOT NULL,
  "status"         "AdminRepairStatus" NOT NULL DEFAULT 'PENDING',
  "cost"           DECIMAL(10,2),
  "technician"     VARCHAR(200),
  "notes"          TEXT,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "admin_repair_logs_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "admin_repair_logs_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "admin_repair_logs_organizationId_status_idx" ON "admin_repair_logs"("organizationId","status");

-- Suppliers
CREATE TABLE IF NOT EXISTS "admin_suppliers" (
  "id"             TEXT                  NOT NULL,
  "organizationId" TEXT                  NOT NULL,
  "name"           VARCHAR(200)          NOT NULL,
  "contactPerson"  VARCHAR(150),
  "email"          VARCHAR(200),
  "phone"          VARCHAR(50),
  "address"        TEXT,
  "category"       VARCHAR(100),
  "status"         "AdminSupplierStatus" NOT NULL DEFAULT 'ACTIVE',
  "notes"          TEXT,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "admin_suppliers_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "admin_suppliers_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "admin_suppliers_organizationId_status_idx" ON "admin_suppliers"("organizationId","status");

-- Equipment inventory
CREATE TABLE IF NOT EXISTS "admin_equipment" (
  "id"             TEXT               NOT NULL,
  "organizationId" TEXT               NOT NULL,
  "name"           VARCHAR(200)       NOT NULL,
  "serialNumber"   VARCHAR(100),
  "category"       VARCHAR(100),
  "location"       VARCHAR(200),
  "purchaseDate"   DATE,
  "warrantyExpiry" DATE,
  "status"         "AdminAssetStatus" NOT NULL DEFAULT 'ACTIVE',
  "notes"          TEXT,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "admin_equipment_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "admin_equipment_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "admin_equipment_organizationId_status_idx" ON "admin_equipment"("organizationId","status");

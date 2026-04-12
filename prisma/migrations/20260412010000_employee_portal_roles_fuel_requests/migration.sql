-- New enums
CREATE TYPE "HrPortalRole" AS ENUM ('EMPLOYEE', 'DRIVER', 'MANAGER');
CREATE TYPE "HrFuelRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- portalRole on hr_employees
ALTER TABLE "hr_employees"
  ADD COLUMN IF NOT EXISTS "portalRole" "HrPortalRole" NOT NULL DEFAULT 'EMPLOYEE';

-- Fuel requests table
CREATE TABLE IF NOT EXISTS "hr_fuel_requests" (
  "id"            TEXT        NOT NULL,
  "employeeId"    TEXT        NOT NULL,
  "date"          DATE        NOT NULL,
  "vehicleInfo"   VARCHAR(200),
  "odometer"      INTEGER,
  "liters"        DECIMAL(6,2) NOT NULL,
  "purpose"       VARCHAR(300) NOT NULL,
  "status"        "HrFuelRequestStatus" NOT NULL DEFAULT 'PENDING',
  "reviewedById"  TEXT,
  "reviewedAt"    TIMESTAMP(3),
  "reviewNote"    VARCHAR(300),
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "hr_fuel_requests_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "hr_fuel_requests_employeeId_fkey"
    FOREIGN KEY ("employeeId") REFERENCES "hr_employees"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "hr_fuel_requests_employeeId_date_idx"
  ON "hr_fuel_requests"("employeeId", "date");

CREATE INDEX IF NOT EXISTS "hr_fuel_requests_employeeId_status_idx"
  ON "hr_fuel_requests"("employeeId", "status");

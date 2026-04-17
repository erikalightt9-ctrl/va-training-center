-- Add new 201 fields to hr_employees
ALTER TABLE "hr_employees"
  ADD COLUMN IF NOT EXISTS "nationality"           VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "presentAddress"        TEXT,
  ADD COLUMN IF NOT EXISTS "permanentAddress"      TEXT,
  ADD COLUMN IF NOT EXISTS "allowance"             DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS "payrollType"           VARCHAR(20),
  ADD COLUMN IF NOT EXISTS "remarks"               TEXT,
  ADD COLUMN IF NOT EXISTS "lastWorkingDate"       DATE,
  ADD COLUMN IF NOT EXISTS "emergencyRelationship" VARCHAR(50);

-- Create hr_employee_documents table
CREATE TABLE IF NOT EXISTS "hr_employee_documents" (
  "id"             TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "employeeId"     TEXT NOT NULL,
  "fileUrl"        TEXT NOT NULL,
  "fileType"       VARCHAR(10) NOT NULL,
  "documentType"   VARCHAR(30) NOT NULL,
  "label"          VARCHAR(150) NOT NULL,
  "fileSize"       INTEGER,
  "uploadedById"   TEXT,
  "isDeleted"      BOOLEAN NOT NULL DEFAULT false,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "hr_employee_documents_pkey" PRIMARY KEY ("id")
);

-- Foreign key
ALTER TABLE "hr_employee_documents"
  ADD CONSTRAINT "hr_employee_documents_employeeId_fkey"
  FOREIGN KEY ("employeeId")
  REFERENCES "hr_employees"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Indexes
CREATE INDEX IF NOT EXISTS "hr_employee_documents_employeeId_idx" ON "hr_employee_documents"("employeeId");
CREATE INDEX IF NOT EXISTS "hr_employee_documents_organizationId_idx" ON "hr_employee_documents"("organizationId");

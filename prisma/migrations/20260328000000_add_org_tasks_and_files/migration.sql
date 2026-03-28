-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- CreateTable: OrganizationTask
CREATE TABLE IF NOT EXISTS "organization_tasks" (
  "id"             TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "title"          VARCHAR(200) NOT NULL,
  "description"    TEXT,
  "status"         "TaskStatus" NOT NULL DEFAULT 'TODO',
  "priority"       "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
  "dueDate"        TIMESTAMP(3),
  "assigneeName"   VARCHAR(100),
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "organization_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable: OrganizationFile
CREATE TABLE IF NOT EXISTS "organization_files" (
  "id"             TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "name"           VARCHAR(255) NOT NULL,
  "size"           INTEGER NOT NULL,
  "mimeType"       VARCHAR(100) NOT NULL,
  "url"            TEXT NOT NULL,
  "uploadedBy"     VARCHAR(100),
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "organization_files_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "organization_tasks"
  ADD CONSTRAINT "organization_tasks_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "organizations"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_files"
  ADD CONSTRAINT "organization_files_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "organizations"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "organization_tasks_organizationId_status_idx"
  ON "organization_tasks"("organizationId", "status");

CREATE INDEX IF NOT EXISTS "organization_tasks_organizationId_dueDate_idx"
  ON "organization_tasks"("organizationId", "dueDate");

CREATE INDEX IF NOT EXISTS "organization_files_organizationId_createdAt_idx"
  ON "organization_files"("organizationId", "createdAt");

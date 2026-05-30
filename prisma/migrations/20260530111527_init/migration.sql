-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'RESIDENT', 'GUARD');

-- CreateEnum
CREATE TYPE "VisitorStatus" AS ENUM ('PENDING', 'TIMED_IN', 'TIMED_OUT');

-- CreateTable
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "unitNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visitors" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "idPictureUrl" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "targetUnit" TEXT NOT NULL,
    "expectedArrival" TIMESTAMP(3) NOT NULL,
    "accessCode" TEXT NOT NULL,
    "status" "VisitorStatus" NOT NULL DEFAULT 'PENDING',
    "timeIn" TIMESTAMP(3),
    "timeOut" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "registeredById" TEXT NOT NULL,

    CONSTRAINT "visitors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_email_key" ON "profiles"("email");

-- CreateIndex
CREATE UNIQUE INDEX "visitors_accessCode_key" ON "visitors"("accessCode");

-- CreateIndex
CREATE INDEX "visitors_accessCode_idx" ON "visitors"("accessCode");

-- CreateIndex
CREATE INDEX "visitors_registeredById_idx" ON "visitors"("registeredById");

-- CreateIndex
CREATE INDEX "visitors_status_idx" ON "visitors"("status");

-- AddForeignKey
ALTER TABLE "visitors" ADD CONSTRAINT "visitors_registeredById_fkey" FOREIGN KEY ("registeredById") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

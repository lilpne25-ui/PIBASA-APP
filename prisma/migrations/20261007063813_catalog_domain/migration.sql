-- CreateEnum
CREATE TYPE "DataSource" AS ENUM ('EXAMPLE', 'VERIFIED');

-- CreateEnum
CREATE TYPE "ShapeType" AS ENUM ('PLATE', 'ROUND_BAR', 'SQUARE_BAR', 'FLAT_BAR', 'TUBE');

-- CreateEnum
CREATE TYPE "SurfaceCondition" AS ENUM ('HOT_ROLLED', 'COLD_DRAWN', 'GROUND', 'ANNEALED');

-- CreateTable
CREATE TABLE "SteelFamily" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SteelFamily_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SteelGrade" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "densityGcm3" DECIMAL(5,3) NOT NULL,
    "hardnessAnnealedHbMax" INTEGER,
    "hardnessWorkingHrcMin" INTEGER,
    "hardnessWorkingHrcMax" INTEGER,
    "wearResistance" INTEGER,
    "toughness" INTEGER,
    "machinability" INTEGER,
    "heatTreatmentNotes" TEXT,
    "chemicalComposition" JSONB,
    "dataSource" "DataSource" NOT NULL DEFAULT 'EXAMPLE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SteelGrade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GradeEquivalence" (
    "id" TEXT NOT NULL,
    "gradeId" TEXT NOT NULL,
    "standard" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "notes" TEXT,
    "dataSource" "DataSource" NOT NULL DEFAULT 'EXAMPLE',

    CONSTRAINT "GradeEquivalence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsageApplication" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "UsageApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GradeApplication" (
    "gradeId" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,

    CONSTRAINT "GradeApplication_pkey" PRIMARY KEY ("gradeId","applicationId")
);

-- CreateTable
CREATE TABLE "SteelVariant" (
    "id" TEXT NOT NULL,
    "gradeId" TEXT NOT NULL,
    "shape" "ShapeType" NOT NULL,
    "condition" "SurfaceCondition" NOT NULL,
    "thicknessMm" DECIMAL(8,3),
    "widthMm" DECIMAL(8,3),
    "diameterMm" DECIMAL(8,3),
    "sideMm" DECIMAL(8,3),
    "wallMm" DECIMAL(8,3),
    "stockLengthMm" INTEGER,
    "dimensionKey" TEXT NOT NULL,
    "dataSource" "DataSource" NOT NULL DEFAULT 'EXAMPLE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SteelVariant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SteelFamily_code_key" ON "SteelFamily"("code");

-- CreateIndex
CREATE UNIQUE INDEX "SteelGrade_code_key" ON "SteelGrade"("code");

-- CreateIndex
CREATE UNIQUE INDEX "SteelGrade_slug_key" ON "SteelGrade"("slug");

-- CreateIndex
CREATE INDEX "SteelGrade_familyId_isActive_idx" ON "SteelGrade"("familyId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "GradeEquivalence_gradeId_standard_designation_key" ON "GradeEquivalence"("gradeId", "standard", "designation");

-- CreateIndex
CREATE UNIQUE INDEX "UsageApplication_code_key" ON "UsageApplication"("code");

-- CreateIndex
CREATE INDEX "GradeApplication_applicationId_idx" ON "GradeApplication"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "SteelVariant_dimensionKey_key" ON "SteelVariant"("dimensionKey");

-- CreateIndex
CREATE INDEX "SteelVariant_gradeId_shape_isActive_idx" ON "SteelVariant"("gradeId", "shape", "isActive");

-- AddForeignKey
ALTER TABLE "SteelGrade" ADD CONSTRAINT "SteelGrade_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "SteelFamily"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GradeEquivalence" ADD CONSTRAINT "GradeEquivalence_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "SteelGrade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GradeApplication" ADD CONSTRAINT "GradeApplication_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "SteelGrade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GradeApplication" ADD CONSTRAINT "GradeApplication_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "UsageApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SteelVariant" ADD CONSTRAINT "SteelVariant_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "SteelGrade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

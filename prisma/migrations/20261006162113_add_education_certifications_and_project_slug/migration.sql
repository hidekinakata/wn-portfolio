-- CreateEnum
CREATE TYPE "LanguageLevel" AS ENUM ('native', 'advanced', 'intermediate', 'basic');

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "slug" TEXT;

-- CreateTable
CREATE TABLE "Education" (
    "id" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "current" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EducationTranslation" (
    "id" TEXT NOT NULL,
    "educationId" TEXT NOT NULL,
    "language" "Language" NOT NULL,
    "degree" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "EducationTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certification" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "url" TEXT,
    "issuedAt" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Certification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LanguageProficiency" (
    "id" TEXT NOT NULL,
    "levelKey" "LanguageLevel" NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LanguageProficiency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LanguageProficiencyTranslation" (
    "id" TEXT NOT NULL,
    "languageProficiencyId" TEXT NOT NULL,
    "language" "Language" NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "LanguageProficiencyTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Education_sortOrder_idx" ON "Education"("sortOrder");

-- CreateIndex
CREATE INDEX "Education_startDate_idx" ON "Education"("startDate" DESC);

-- CreateIndex
CREATE INDEX "EducationTranslation_language_idx" ON "EducationTranslation"("language");

-- CreateIndex
CREATE UNIQUE INDEX "EducationTranslation_educationId_language_key" ON "EducationTranslation"("educationId", "language");

-- CreateIndex
CREATE INDEX "Certification_sortOrder_idx" ON "Certification"("sortOrder");

-- CreateIndex
CREATE INDEX "Certification_issuedAt_idx" ON "Certification"("issuedAt" DESC);

-- CreateIndex
CREATE INDEX "LanguageProficiency_sortOrder_idx" ON "LanguageProficiency"("sortOrder");

-- CreateIndex
CREATE INDEX "LanguageProficiencyTranslation_language_idx" ON "LanguageProficiencyTranslation"("language");

-- CreateIndex
CREATE UNIQUE INDEX "LanguageProficiencyTranslation_languageProficiencyId_langua_key" ON "LanguageProficiencyTranslation"("languageProficiencyId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- AddForeignKey
ALTER TABLE "EducationTranslation" ADD CONSTRAINT "EducationTranslation_educationId_fkey" FOREIGN KEY ("educationId") REFERENCES "Education"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LanguageProficiencyTranslation" ADD CONSTRAINT "LanguageProficiencyTranslation_languageProficiencyId_fkey" FOREIGN KEY ("languageProficiencyId") REFERENCES "LanguageProficiency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

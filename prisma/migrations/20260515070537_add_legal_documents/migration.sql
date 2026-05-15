-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('COURSE_PURCHASE', 'FEATURED_REQUEST');

-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "featureRequested" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "type" "PaymentType" NOT NULL DEFAULT 'COURSE_PURCHASE';

-- CreateTable
CREATE TABLE "jobs" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "salary" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "deadline" TIMESTAMP(3),
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_applications" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "resumeLink" TEXT NOT NULL,
    "coverLetter" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "jobId" TEXT NOT NULL,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "newsletter_subscribers" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "newsletter_subscribers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "legal_documents" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "legal_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "jobs_category_idx" ON "jobs"("category");

-- CreateIndex
CREATE INDEX "jobs_type_idx" ON "jobs"("type");

-- CreateIndex
CREATE INDEX "jobs_isPublished_idx" ON "jobs"("isPublished");

-- CreateIndex
CREATE INDEX "job_applications_jobId_idx" ON "job_applications"("jobId");

-- CreateIndex
CREATE INDEX "job_applications_status_idx" ON "job_applications"("status");

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_subscribers_email_key" ON "newsletter_subscribers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "legal_documents_slug_key" ON "legal_documents"("slug");

-- CreateIndex
CREATE INDEX "courses_isPublished_idx" ON "courses"("isPublished");

-- CreateIndex
CREATE INDEX "courses_isDeleted_idx" ON "courses"("isDeleted");

-- CreateIndex
CREATE INDEX "lessons_isDeleted_idx" ON "lessons"("isDeleted");

-- CreateIndex
CREATE INDEX "modules_courseId_idx" ON "modules"("courseId");

-- CreateIndex
CREATE INDEX "modules_isDeleted_idx" ON "modules"("isDeleted");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- AddForeignKey
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

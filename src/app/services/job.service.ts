//  ====================
//      Job Service
// ====================

import { prisma } from "../../lib/prisma";
import { Prisma } from "@prisma/client";
import { CustomAppError } from "../errors/customError";

// ============================== CREATE Job ==============================
const createJob = async (data: Record<string, unknown>) => {
  return await prisma.job.create({
    data: data as unknown as Prisma.JobCreateInput,
  });
};

// ============================== GET ALL Jobs ==============================
const getAllJobs = async (query: Record<string, unknown>) => {
  const page = Number(query.page as string) || 1;
  const limit = Number(query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const { search, category, type } = query;
  const where: Record<string, unknown> = {
    isPublished: true,
    ...(search && {
      OR: [
        { title: { contains: search as string, mode: "insensitive" } },
        { description: { contains: search as string, mode: "insensitive" } },
      ],
    }),
    ...(category && { category: category as string }),
    ...(type && { type: type as string }),
  };

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where: where as Prisma.JobWhereInput,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.job.count({ where: where as Prisma.JobWhereInput }),
  ]);

  return {
    jobs,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

// ============================== GET Single Job ==============================
const getJobById = async (id: string) => {
  return await prisma.job.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      category: true,
      location: true,
      type: true,
      salary: true,
      description: true,
      deadline: true,
      isPublished: true,
      createdAt: true,
      updatedAt: true,
      applications: {
        select: {
          id: true,
          fullName: true,
          email: true,
          resumeLink: true,
          coverLetter: true,
          status: true,
          appliedAt: true
        }
      }
    },
  });
};

// ============================== UPDATE Job ==============================
const updateJob = async (id: string, data: Record<string, unknown>) => {
  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) throw new CustomAppError(404, "Job not found for update");

  return await prisma.job.update({
    where: { id },
    data: data as unknown as Prisma.JobUpdateInput,
  });
};

// ============================== DELETE Job ==============================
const deleteJob = async (id: string) => {
  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) throw new CustomAppError(404, "Job not found for deletion");

  return await prisma.job.delete({
    where: { id },
  });
};

// ============================== APPLY For Job ==============================
const applyForJob = async (data: Record<string, unknown>) => {
  return await prisma.jobApplication.create({
    data: data as unknown as Prisma.JobApplicationCreateInput,
  });
};

// ============================== GET Admin Applications ==============================
const getAllApplications = async (query: Record<string, unknown>) => {
  const page = Number(query.page as string) || 1;
  const limit = Number(query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const [applications, total] = await Promise.all([
    prisma.jobApplication.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        resumeLink: true,
        coverLetter: true,
        status: true,
        appliedAt: true,
        job: {
          select: {
            id: true,
            title: true,
            category: true
          }
        }
      },
      orderBy: { appliedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.jobApplication.count()
  ]);

  return {
    applications,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
};

export const jobService = {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  applyForJob,
  getAllApplications
};

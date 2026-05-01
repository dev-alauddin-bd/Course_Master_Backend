//  ====================
//      Job Service
// ====================

import { prisma } from "../../lib/prisma";

export const jobService = {
  // ============================== CREATE Job ==============================
  async createJob(data: any) {
    return await prisma.job.create({
      data,
    });
  },

  // ============================== GET ALL Jobs ==============================
  async getAllJobs(query: any) {
    const { search, category, type } = query;

    return await prisma.job.findMany({
      where: {
        isPublished: true,
        ...(search && {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }),
        ...(category && { category }),
        ...(type && { type }),
      },
      orderBy: { createdAt: "desc" },
    });
  },

  // ============================== GET Single Job ==============================
  async getJobById(id: string) {
    return await prisma.job.findUnique({
      where: { id },
      include: { applications: true },
    });
  },

  // ============================== UPDATE Job ==============================
  async updateJob(id: string, data: any) {
    return await prisma.job.update({
      where: { id },
      data,
    });
  },

  // ============================== DELETE Job ==============================
  async deleteJob(id: string) {
    return await prisma.job.delete({
      where: { id },
    });
  },

  // ============================== APPLY For Job ==============================
  async applyForJob(data: any) {
    return await prisma.jobApplication.create({
      data,
    });
  },

  // ============================== GET Admin Applications ==============================
  async getAllApplications() {
    return await prisma.jobApplication.findMany({
      include: { job: true },
      orderBy: { appliedAt: "desc" },
    });
  },
};

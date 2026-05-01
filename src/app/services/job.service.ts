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
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    const { search, category, type } = query;

    const where: any = {
      isPublished: true,
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(category && { category }),
      ...(type && { type }),
    };

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.job.count({ where }),
    ]);

    return {
      jobs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  },

  // ============================== GET Single Job ==============================
  async getJobById(id: string) {
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
  async getAllApplications(query: any) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
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
  },
};

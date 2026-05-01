//  ====================
//   Assignment Service
// ====================

import { prisma } from "../../lib/prisma";
import { CustomAppError } from "../errors/customError";

export const AssignmentService = {
  // ============================== CREATE Assignment ==============================
  async createAssignment(payload: { moduleId: string; description: string; }) {
    const { moduleId, description } = payload;

    const module = await prisma.module.findUnique({
      where: { id: moduleId },
    });

    if (!module) {
      throw new CustomAppError(404, "Module not found");
    }

    const existingAssignment = await prisma.assignment.findFirst({
      where: { moduleId }
    });

    if (existingAssignment) {
      throw new CustomAppError(400, "This module already contains an assignment. Please edit the existing one.");
    }

    return await prisma.assignment.create({
      data: { moduleId, description },
    });
  },

  async getAssignmentsIntoIntrutorCourses(instructorId: string, query: any = {}) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where = {
      module: {
        course: { instructorId: instructorId },
      },
    };

    const [assignments, total] = await Promise.all([
      prisma.assignment.findMany({
        where,
        select: {
          id: true,
          description: true,
          moduleId: true,
          deadline: true,
          createdAt: true,
          updatedAt: true,
          module: {
            select: {
              title: true,
              course: { select: { title: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.assignment.count({ where })
    ]);

    return {
      assignments,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  },

  // ============================== UPDATE Assignment ==============================
  async updateAssignment(id: string, payload: Partial<{ description: string; }>) {
    return await prisma.assignment.update({
      where: { id },
      data: {
        ...(payload.description && { description: payload.description }),
      },
    });
  },

  // ============================== DELETE Assignment ==============================
  async deleteAssignment(id: string) {
    return await prisma.assignment.delete({
      where: { id },
    });
  },

  // ============================== SUBMIT Assignment ==============================
  async submitAssignment(assignmentId: string, userId: string, content: string) {
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId }
    });

    if (!assignment) {
      throw new CustomAppError(404, "Assignment not found");
    }

    return await prisma.assignmentSubmission.upsert({
      where: {
        userId_assignmentId: { userId, assignmentId }
      },
      update: {
        content,
        status: "submitted"
      },
      create: {
        userId,
        assignmentId,
        content,
      }
    });
  },
};
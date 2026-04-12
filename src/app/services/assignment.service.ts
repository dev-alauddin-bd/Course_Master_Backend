import { prisma } from "../../lib/prisma";
import { CustomAppError } from "../errors/customError";

/**
 * Create or update assignment
 */
const createAssignment = async (payload: {
  moduleId: string;
  description: string;
}) => {
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

  const assignment = await prisma.assignment.create({
    data: {
      moduleId,
      description,
    },
  });

  return assignment;
};

/**
 * Get all assignments
 */
const getAssignmentsIntoIntrutorCourses = async (instructorId: string) => {
  return await prisma.assignment.findMany({
    where: {
      module: {
        course: {
          instructorId: instructorId, // ✅ IMPORTANT
        },
      },
    },
    include: {
      module: {
        select: {
          title: true,
          course: {
            select: { title: true },
          },
        },
      },
    },
  });
};

/**
 * Update assignment
 */
const updateAssignment = async (
  id: string,
  payload: Partial<{
    description: string;
  }>
) => {
  return await prisma.assignment.update({
    where: { id },
    data: {
      ...(payload.description && { description: payload.description }),
    },
  });
};

/**
 * Delete assignment
 */
const deleteAssignment = async (id: string) => {
  return await prisma.assignment.delete({
    where: { id },
  });
};



/**
 * Submit assignment
 */
const submitAssignment = async (assignmentId: string, userId: string, content: string) => {
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId }
  });

  if (!assignment) {
    throw new CustomAppError(404, "Assignment not found");
  }

  const submission = await prisma.assignmentSubmission.upsert({
    where: {
      userId_assignmentId: {
        userId,
        assignmentId
      }
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

  return submission;
};

// ✅ Bottom Export
export const AssignmentService = {
  createAssignment,
  getAssignmentsIntoIntrutorCourses,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
};
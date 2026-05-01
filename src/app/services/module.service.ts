//  ====================
//     Module Service
// ====================

import { prisma } from "../../lib/prisma";
import { CustomAppError } from "../errors/customError";

export const moduleService = {
  // ============================== ADD Module ==============================
  async addModule(courseId: string, moduleData: { title: string }) {
    // Check if course exists before adding module
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new CustomAppError(404, "Course not found to attach module");

    // Calculate the next order index for sequential playback/display
    const lastModule = await prisma.module.findFirst({
      where: { courseId },
      orderBy: { order: 'desc' }
    });
    const nextOrder = lastModule ? lastModule.order + 1 : 0;

    return await prisma.module.create({
      data: {
        title: moduleData.title,
        courseId,
        order: nextOrder
      }
    });
  },

  // ============================== UPDATE Module ==============================
  async updateModule(moduleId: string, payload: { title?: string }) {
    const mod = await prisma.module.findUnique({ where: { id: moduleId } });
    if (!mod) throw new CustomAppError(404, "Module not found for update");

    return await prisma.module.update({
      where: { id: moduleId },
      data: payload
    });
  },

  // ============================== DELETE Module ==============================
  async deleteModule(moduleId: string) {
    return await prisma.module.delete({ where: { id: moduleId } });
  },

  // ============================== GET Modules By Course ID ==============================
  async getModulesByCourseId(courseId: string, userId: string) {
    // Linear progression logic can be implemented here if needed in the future
    return { modules: null }; 
  },

  // ============================== GET ALL Modules ==============================
  async getAllModules(courseId?: string) {
    return await prisma.module.findMany({
      where: courseId ? { courseId } : {},
      select: {
        id: true,
        title: true,
        courseId: true,
        order: true,
        isDeleted: true,
        course: { select: { title: true } },
        _count: { select: { lessons: true } }
      },
      orderBy: { order: "asc" },
    });
  },
};

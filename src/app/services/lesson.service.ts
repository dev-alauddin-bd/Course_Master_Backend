//  ====================
//     Lesson Service
// ====================

import { prisma } from "../../lib/prisma";
import { CustomAppError } from "../errors/customError";
import logger from "../../lib/logger";

// ============================== GET ALL Lessons ==============================
const getAllLessons = async (moduleId?: string) => {
  return await prisma.lesson.findMany({
    where: moduleId ? { moduleId } : {},
    select: {
      id: true,
      title: true,
      videoUrl: true,
      duration: true,
      moduleId: true,
      order: true,
      module: { 
        select: { 
          title: true,
          course: { select: { title: true } }
        } 
      }
    },
    orderBy: { order: "asc" },
  });
};

// ============================== GET Lesson By ID ==============================
const getLessonById = async (lessonId: string) => {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: {
      id: true,
      title: true,
      content: true,
      videoUrl: true,
      duration: true,
      moduleId: true,
      order: true,
      module: {
        select: {
          title: true,
          course: { select: { title: true } }
        }
      }
    },
  });

  if (!lesson) throw new CustomAppError(404, "Lesson not found");
  return lesson;
};

// ============================== ADD Lesson ==============================
const addLesson = async (payload: {
  moduleId: string;
  title: string;
  videoUrl: string;
  duration: number;
}) => {
  logger.info("Adding lesson with payload:", payload);
  const mod = await prisma.module.findUnique({ where: { id: payload.moduleId } });
  if (!mod) throw new CustomAppError(404, "Parent module not found for lesson attachment");

  const lastLesson = await prisma.lesson.findFirst({
    where: { moduleId: payload.moduleId },
    orderBy: { order: 'desc' }
  });
  const nextOrder = lastLesson ? lastLesson.order + 1 : 0;

  return await prisma.lesson.create({
    data: {
      title: payload.title,
      videoUrl: payload.videoUrl,
      duration: payload.duration,
      moduleId: payload.moduleId,
      order: nextOrder
    }
  });
};

// ============================== UPDATE Lesson ==============================
const updateLesson = async (lessonId: string, payload: Partial<{ title: string; videoUrl: string; duration: number }>) => {
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson) throw new CustomAppError(404, "Lesson not found for update");
  
  return await prisma.lesson.update({
    where: { id: lessonId },
    data: payload
  });
};

// ============================== DELETE Lesson ==============================
const deleteLesson = async (lessonId: string) => {
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson) throw new CustomAppError(404, "Lesson not found for deletion");

  return await prisma.lesson.delete({
    where: { id: lessonId }
  });
};

export const lessonService = {
  getAllLessons,
  getLessonById,
  addLesson,
  updateLesson,
  deleteLesson
};

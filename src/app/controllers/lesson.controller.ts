//  ====================
//    Lesson Controller
// ====================

import { Request, RequestHandler, Response } from "express";
import { catchAsyncHandler } from "../utils/catchAsyncHandler";
import { lessonService } from "../services/lesson.service";
import { sendResponse } from "../utils/sendResponse";
import { createLessonValidation, updateLessonValidation } from "../validations/lesson.validation";
import logger from "../../lib/logger";

// ============================== ADD Lesson ==============================
const addLesson = catchAsyncHandler(async (req: Request, res: Response) => {
  logger.info("Received request to add lesson with body:", req.body);
  const validated = createLessonValidation.parse(req.body);
  const lesson = await lessonService.addLesson(validated);
  sendResponse(res, 201, "Lesson added successfully", lesson);
});

// ============================== UPDATE Lesson ==============================
const updateLesson = catchAsyncHandler(async (req: Request, res: Response) => {
  const { lessonId } = req.params;
  const validated = updateLessonValidation.parse(req.body);
  const lesson = await lessonService.updateLesson(lessonId as string, validated);
  sendResponse(res, 200, "Lesson updated successfully", lesson);
});

// ============================== DELETE Lesson ==============================
const deleteLesson = catchAsyncHandler(async (req: Request, res: Response) => {
  const { lessonId } = req.params;
  await lessonService.deleteLesson(lessonId as string);
  sendResponse(res, 200, "Lesson deleted successfully");
});

// ============================== GET Lesson By ID ==============================
const getLessonById = catchAsyncHandler(async (req: Request, res: Response) => {
  const { lessonId } = req.params;
  const lesson = await lessonService.getLessonById(lessonId as string);
  sendResponse(res, 200, "Lesson fetched successfully", lesson);
});

// ============================== GET ALL Lessons ==============================
const getAllLessons = catchAsyncHandler(async (req: Request, res: Response) => {
  const { moduleId } = req.query;
  const lessons = await lessonService.getAllLessons(moduleId as string);
  sendResponse(res, 200, "Lessons fetched successfully", lessons);
});

export const lessonController: LessonController = {
  addLesson,
  updateLesson,
  deleteLesson,
  getLessonById,
  getAllLessons,
};

type LessonController = {
  addLesson: RequestHandler;
  updateLesson: RequestHandler;
  deleteLesson: RequestHandler;
  getLessonById: RequestHandler;
  getAllLessons: RequestHandler;
}
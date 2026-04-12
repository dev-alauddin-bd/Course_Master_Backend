
import { Request, RequestHandler, Response } from "express";
import { courseService } from "../services/course.service";
import { catchAsyncHandler } from "../utils/catchAsyncHandler";
import { sendResponse } from "../utils/sendResponse";

// ==============================
// CREATE a course
// ==============================
const createCourse = catchAsyncHandler(async (req: Request, res: Response) => {
  console.log("Received course creation request with data:", req.body);
  const instructorId = req.user!.id;
  const course = await courseService.createCourse({ ...req.body, instructorId });
  sendResponse(res, 201, "Course created successfully", course);
});


// ==============================
// GET all courses with advanced features
// ==============================
const getAllCourses = catchAsyncHandler(async (req: Request, res: Response) => {
  const { page, limit, search, category, sort } = req.query;

  const courses = await courseService.getAllCourses({
    page: Number(page) || 1,
    limit: Number(limit) || 10,
    search: search?.toString(),
    category: category?.toString(),
    sort: sort?.toString(),
  });
  // console.log("Fetched courses with query:", req.query, "Result count:", courses);

  sendResponse(res, 200, "Courses fetched successfully", courses);
});


// ==============================
// GET course by ID
// ==============================
const getCourseById = catchAsyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const course = await courseService.getCourseById(req.params.id as string, userId);
  sendResponse(res, 200, "Course fetched successfully", course);
});


/**
 * Mark a specific course lesson as completed for the current student
 */
const completeLesson = catchAsyncHandler(async (req: Request, res: Response) => {
  const { courseId, lessonId } = req.body;
  const userId = req.user!.id;

  await courseService.completeLesson(userId, courseId, lessonId);
  sendResponse(res, 200, "Progress tracked: Lesson marked as completed");
});



// ==============================
// UPDATE a course
// ==============================
const updateCourse = catchAsyncHandler(async (req: Request, res: Response) => {
  const course = await courseService.updateCourse(req.params.id as string, req.body);
  sendResponse(res, 200, "Course updated successfully", course);
});

// ==============================
// DELETE a course
// ==============================
const deleteCourse = catchAsyncHandler(async (req: Request, res: Response) => {
  const result = await courseService.deleteCourse(req.params.id as string);
  sendResponse(res, 200, result.message);
});

/**
 * Retrieve all courses the current user is enrolled in
 */
const getMyCourses = catchAsyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const courses = await courseService.getMyCourses(userId);
  sendResponse(res, 200, "Your enrolled courses fetched successfully", courses);
});

export const courseController:CourseController = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  getMyCourses,
  completeLesson,
};

type CourseController = {
  createCourse: RequestHandler;
  getAllCourses: RequestHandler;
  getCourseById: RequestHandler;
  updateCourse: RequestHandler;
  deleteCourse: RequestHandler;
  getMyCourses: RequestHandler;
  completeLesson: RequestHandler;
}

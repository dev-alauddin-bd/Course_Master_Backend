//  ====================
//    Enroll Controller
// ====================

import { Request, RequestHandler, Response } from "express";
import { catchAsyncHandler } from "../utils/catchAsyncHandler";
import { sendResponse } from "../utils/sendResponse";
import { enrollService } from "../services/enroll.service";
import { enrollValidation } from "../validations/enroll.validation";
import { getIO } from "../../lib/socket";

// ============================== ENROLL In Course ==============================
const enrollCourse = catchAsyncHandler(async (req: Request, res: Response) => {
  const validated = enrollValidation.parse(req.body);
  const userId = req.user!.id;
  const enrollment = await enrollService.enrollCourse(userId, validated.courseId);
  
  try {
    getIO().emit("new_notification", { 
      message: "Someone just enrolled in a course!", 
      type: "success" 
    });
  } catch (err) {
    // ignore if socket is not ready
  }

  sendResponse(res, 201, "Enrolled successfully", enrollment);
});

// ============================== GET My Enrollments ==============================
const getMyEnrollments = catchAsyncHandler(async (req: Request, res: Response) => {
  const result = await enrollService.getMyEnrollments(req.user!.id, req.query);
  sendResponse(res, 200, "Enrollments fetched successfully", result);
});

// ============================== GET Enrolled Content ==============================
const getEnrolledCourseContent = catchAsyncHandler(async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const userId = req.user!.id;
  const courseContent = await enrollService.getEnrolledCourseContent(userId, courseId as string);
  sendResponse(res, 200, "Course content fetched successfully", courseContent);
});

export const enrollController: EnrollController = {
  enrollCourse,
  getMyEnrollments,
  getEnrolledCourseContent,
};

type EnrollController = {
  enrollCourse: RequestHandler;
  getMyEnrollments: RequestHandler;
  getEnrolledCourseContent: RequestHandler;
}
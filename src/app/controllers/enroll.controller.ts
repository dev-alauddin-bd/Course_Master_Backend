import { Request, RequestHandler, Response } from "express";
import { catchAsyncHandler } from "../utils/catchAsyncHandler";
import { sendResponse } from "../utils/sendResponse";
import { enrollService } from "../services/enroll.service";
import { enrollValidation } from "../validations/enroll.validation";

const enrollCourse = catchAsyncHandler(async (req: Request, res: Response) => {
  console.log("Received enrollment request with data:", req.body);
  // Validate request
  const validated = enrollValidation.parse(req.body);

  const userId = req.user!.id;
  const enrollment = await enrollService.enrollCourse(userId, validated.courseId);
  console.log("enrollment", enrollment)

  sendResponse(res, 201, "Enrolled successfully", enrollment);
});

const getMyEnrollments = catchAsyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const enrollments = await enrollService.getMyEnrollments(userId);
  sendResponse(res, 200, "Enrollments fetched successfully", enrollments);
});

const getEnrolledCourseContent = catchAsyncHandler(async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const userId = req.user!.id;
  const courseContent = await enrollService.getEnrolledCourseContent(userId, courseId as string);
  sendResponse(res, 200, "Course content fetched successfully", courseContent);
});


export const enrollController:EnrollController = {
  enrollCourse,
  getMyEnrollments,
  getEnrolledCourseContent,
};

type EnrollController = {
  enrollCourse: RequestHandler;
  getMyEnrollments: RequestHandler;
  getEnrolledCourseContent: RequestHandler;
}
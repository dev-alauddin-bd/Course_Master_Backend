//  ====================
//    Enroll Controller
// ====================

import { Request, RequestHandler, Response } from "express";
import { catchAsyncHandler } from "../utils/catchAsyncHandler";
import { sendResponse } from "../utils/sendResponse";
import { enrollService } from "../services/enroll.service";
import { notificationService } from "../services/notification.service";
import { prisma } from "../../lib/prisma";

// ============================== ENROLL In Course ==============================
const enrollCourse = catchAsyncHandler(async (req: Request, res: Response) => {
  // req.body already validated by validate(enrollValidation) middleware
  const { courseId } = req.body as { courseId: string };
  const userId = req.user!.id;
  const enrollment = await enrollService.enrollCourse(userId, courseId);
  
  // Get course details to notify instructor
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { title: true, instructorId: true }
  });

  if (course) {
    // 🔒 SECURITY FIX: Only notify admin and the course instructor
    await notificationService.notifyAdminAndInstructor(
      {
        message: `📚 New Student Enrolled: ${course.title}`,
        type: "success",
        data: { courseId, studentId: userId }
      },
      course.instructorId
    );
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
//  ====================
//   Student Submission
//      Controller
// ====================

import { Request, RequestHandler, Response } from "express";
import { catchAsyncHandler } from "../utils/catchAsyncHandler";
import { sendResponse } from "../utils/sendResponse";
import { AssignmentService } from "../services/assignment.service";
import { notificationService } from "../services/notification.service";
import { prisma } from "../../lib/prisma";

// ============================== SUBMIT Assignment ==============================
const submitAssignment = catchAsyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { assignmentId, content } = req.body;
  const submission = await AssignmentService.submitAssignment(assignmentId, userId, content);

  try {
    // 🔒 SECURITY FIX: Only notify admin and course instructor about submission
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      select: { module: { select: { course: { select: { instructorId: true } } } } }
    });

    if (assignment?.module?.course) {
      await notificationService.notifyAdminAndInstructor(
        {
          message: "📝 A student has submitted an assignment!",
          type: "info",
          data: { assignmentId, studentId: userId }
        },
        assignment.module.course.instructorId
      );
    }
  } catch (_err) {
    // Socket emit failed, ignore for now
  }

  sendResponse(res, 201, "Assignment submitted successfully", submission);
});

export const studentSubmissionController: StudentSubmissionController = {
  submitAssignment,
};

type StudentSubmissionController = {
  submitAssignment: RequestHandler;
}
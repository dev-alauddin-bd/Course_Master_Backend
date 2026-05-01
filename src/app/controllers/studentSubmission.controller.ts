//  ====================
//   Student Submission
//      Controller
// ====================

import { Request, RequestHandler, Response } from "express";
import { catchAsyncHandler } from "../utils/catchAsyncHandler";
import { sendResponse } from "../utils/sendResponse";
import { AssignmentService } from "../services/assignment.service";

// ============================== SUBMIT Assignment ==============================
const submitAssignment = catchAsyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { assignmentId, content } = req.body;
  const submission = await AssignmentService.submitAssignment(assignmentId, userId, content);
  sendResponse(res, 201, "Assignment submitted successfully", submission);
});

export const studentSubmissionController: StudentSubmissionController = {
  submitAssignment,
};

type StudentSubmissionController = {
  submitAssignment: RequestHandler;
}
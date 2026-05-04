//  ====================
//  Assignment Controller
// ====================

import { Request, RequestHandler, Response } from "express";
import { catchAsyncHandler } from "../utils/catchAsyncHandler";
import { sendResponse } from "../utils/sendResponse";
import { AssignmentService } from "../services/assignment.service";
import { notificationService } from "../services/notification.service";

// ============================== CREATE Assignment ==============================
const createAssignment = catchAsyncHandler(async (req: Request, res: Response) => {
  const assignment = await AssignmentService.createAssignment(req.body);

  try {
    // 🔒 SECURITY FIX: Only notify students and admin about new assignment
    await notificationService.notifyRole("student", {
      message: "📚 A new assignment has been posted!",
      type: "success",
      data: { assignmentId: assignment.id }
    });
    await notificationService.notifyAdmin({
      message: "📚 A new assignment has been created!",
      type: "success",
      data: { assignmentId: assignment.id }
    });
  } catch (_err) {
    // Socket emit failed, ignore for now
  }

  sendResponse(res, 201, "Assignment created successfully", assignment);
});

// ============================== GET Instructor Assignments ==============================
const getAssignmentsIntoIntrutorCourses = catchAsyncHandler(async (req: Request, res: Response) => {
  const result = await AssignmentService.getAssignmentsIntoIntrutorCourses(req.user!.id, req.query);
  sendResponse(res, 200, "Instructor assignments fetched successfully", result);
});

// ============================== UPDATE Assignment ==============================
const updateAssignment = catchAsyncHandler(async (req: Request, res: Response) => {
  const assignment = await AssignmentService.updateAssignment(req.params.id as string, req.body);
  sendResponse(res, 200, "Assignment updated successfully", assignment);
});

// ============================== DELETE Assignment ==============================
const deleteAssignment = catchAsyncHandler(async (req: Request, res: Response) => {
  await AssignmentService.deleteAssignment(req.params.id as string);
  sendResponse(res, 200, "Assignment deleted successfully");
});

export const assignmentController: AssignmentController = {
  createAssignment,
  getAssignmentsIntoIntrutorCourses,
  updateAssignment,
  deleteAssignment,
};

type AssignmentController = {
  createAssignment: RequestHandler;
  getAssignmentsIntoIntrutorCourses: RequestHandler;
  updateAssignment: RequestHandler;
  deleteAssignment: RequestHandler;
}
//  ====================
//   Dashboard Controller
// ====================

import { Request, RequestHandler, Response } from "express";
import { catchAsyncHandler } from "../utils/catchAsyncHandler";
import { sendResponse } from "../utils/sendResponse";
import { dashboardService } from "../services/dashboard.service";
import { IUser } from "../interfaces/user.interface";

// ============================== GET Admin Analytics ==============================
const getAdminAnalytics = catchAsyncHandler(async (req: Request, res: Response) => {
  const analyticsData = await dashboardService.getAdminAnalytics();
  sendResponse(res, 200, "Admin analytics successfully retrieved", analyticsData);
});

// ============================== GET Instructor Analytics ==============================
const getInstructorAnalytics = catchAsyncHandler(async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const analyticsData = await dashboardService.getInstructorAnalytics(user.id);
  sendResponse(res, 200, "Instructor analytics successfully retrieved", analyticsData);
});

// ============================== GET Student Analytics ==============================
const getStudentAnalytics = catchAsyncHandler(async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const analyticsData = await dashboardService.getStudentAnalytics(user.id);
  sendResponse(res, 200, "Student analytics successfully retrieved", analyticsData);
});

export const dashboardController: DashboardController = {
  getAdminAnalytics,
  getInstructorAnalytics,
  getStudentAnalytics,
};

type DashboardController = {
  getAdminAnalytics: RequestHandler;
  getInstructorAnalytics: RequestHandler;
  getStudentAnalytics: RequestHandler;
}
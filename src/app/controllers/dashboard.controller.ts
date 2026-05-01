//  ====================
//   Dashboard Controller
// ====================

import { Request, RequestHandler, Response } from "express";
import { catchAsyncHandler } from "../utils/catchAsyncHandler";
import { sendResponse } from "../utils/sendResponse";
import { dashboardService } from "../services/dashboard.service";
import { IUser } from "../interfaces/user.interface";

// ============================== GET Analytics ==============================
const getDashboardAnalytics = catchAsyncHandler(async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const analyticsData = await dashboardService.getDashboardAnalytics(user);
  sendResponse(res, 200, "Dashboard analytics successfully retrieved", analyticsData);
});

export const dashboardController: DashboardController = {
  getDashboardAnalytics,
};

type DashboardController = {
  getDashboardAnalytics: RequestHandler;
}
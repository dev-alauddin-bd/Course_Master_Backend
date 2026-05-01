//  ====================
//    Module Controller
// ====================

import { Request, RequestHandler, Response } from "express";
import { moduleService } from "../services/module.service";
import { catchAsyncHandler } from "../utils/catchAsyncHandler";
import { sendResponse } from "../utils/sendResponse";

// ============================== ADD Module ==============================
const addModule = catchAsyncHandler(async (req: Request, res: Response) => {
  const { courseId, title } = req.body;
  const module = await moduleService.addModule(courseId, { title });
  sendResponse(res, 201, "Module added successfully", module);
});

// ============================== UPDATE Module ==============================
const updateModule = catchAsyncHandler(async (req: Request, res: Response) => {
  const { moduleId } = req.params;
  const module = await moduleService.updateModule(moduleId as string, req.body);
  sendResponse(res, 200, "Module updated successfully", module);
});

// ============================== DELETE Module ==============================
const deleteModule = catchAsyncHandler(async (req: Request, res: Response) => {
  const { moduleId } = req.params;
  await moduleService.deleteModule(moduleId as string);
  sendResponse(res, 200, "Module deleted successfully");
});

// ============================== GET Modules By Course ID ==============================
const getModuleByCourseId = catchAsyncHandler(async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const studentId = req.user?.id;
  const modules = await moduleService.getModulesByCourseId(courseId as string, studentId as string);
  sendResponse(res, 200, "Modules fetched successfully", modules);
});

// ============================== GET ALL Modules ==============================
const getAllModules = catchAsyncHandler(async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const modules = await moduleService.getAllModules(courseId as string);
  sendResponse(res, 200, "All modules fetched successfully", modules);
});

export const moduleController: ModuleController = {
  addModule,
  updateModule,
  deleteModule,
  getModuleByCourseId,
  getAllModules,
};

type ModuleController = {
  addModule: RequestHandler;
  updateModule: RequestHandler;
  deleteModule: RequestHandler;
  getModuleByCourseId: RequestHandler;
  getAllModules: RequestHandler;
}

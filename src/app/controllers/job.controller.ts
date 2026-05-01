//  ====================
//     Job Controller
// ====================

import { Request, RequestHandler, Response } from "express";
import { jobService } from "../services/job.service";
import { catchAsyncHandler } from "../utils/catchAsyncHandler";
import { sendResponse } from "../utils/sendResponse";

// ============================== CREATE Job ==============================
const createJob = catchAsyncHandler(async (req: Request, res: Response) => {
  const result = await jobService.createJob(req.body);
  sendResponse(res, 201, "Job created successfully", result);
});

// ============================== GET ALL Jobs ==============================
const getAllJobs = catchAsyncHandler(async (req: Request, res: Response) => {
  const result = await jobService.getAllJobs(req.query);
  sendResponse(res, 200, "Jobs fetched successfully", result);
});

// ============================== GET Single Job ==============================
const getJobById = catchAsyncHandler(async (req: Request, res: Response) => {
  const result = await jobService.getJobById(req.params.id as string);
  sendResponse(res, 200, "Job fetched successfully", result);
});

// ============================== UPDATE Job ==============================
const updateJob = catchAsyncHandler(async (req: Request, res: Response) => {
  const result = await jobService.updateJob(req.params.id as string, req.body);
  sendResponse(res, 200, "Job updated successfully", result);
});

// ============================== DELETE Job ==============================
const deleteJob = catchAsyncHandler(async (req: Request, res: Response) => {
  const result = await jobService.deleteJob(req.params.id as string);
  sendResponse(res, 200, "Job deleted successfully", result);
});

// ============================== APPLY For Job ==============================
const applyForJob = catchAsyncHandler(async (req: Request, res: Response) => {
  const result = await jobService.applyForJob(req.body);
  sendResponse(res, 201, "Application submitted successfully", result);
});

// ============================== GET Admin Applications ==============================
const getAllApplications = catchAsyncHandler(async (req: Request, res: Response) => {
  const result = await jobService.getAllApplications(req.query);
  sendResponse(res, 200, "Applications fetched successfully", result);
});

export const jobController: JobController = {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  applyForJob,
  getAllApplications,
};

type JobController = {
  createJob: RequestHandler;
  getAllJobs: RequestHandler;
  getJobById: RequestHandler;
  updateJob: RequestHandler;
  deleteJob: RequestHandler;
  applyForJob: RequestHandler;
  getAllApplications: RequestHandler;
}

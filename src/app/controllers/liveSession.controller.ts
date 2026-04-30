import { Request, RequestHandler, Response } from "express";
import { liveSessionService } from "../services/liveSession.service";
import { catchAsyncHandler } from "../utils/catchAsyncHandler";
import { sendResponse } from "../utils/sendResponse";

const registerForSession = catchAsyncHandler(async (req: Request, res: Response) => {
  const result = await liveSessionService.registerForSession(req.body);
  sendResponse(res, 201, "Registration successful", result);
});

const getAllSessions = catchAsyncHandler(async (req: Request, res: Response) => {
  const result = await liveSessionService.getAllSessions();
  sendResponse(res, 200, "Sessions fetched successfully", result);
});

const getSessionById = catchAsyncHandler(async (req: Request, res: Response) => {
  const result = await liveSessionService.getSessionById(req.params.id as string);
  sendResponse(res, 200, "Session fetched successfully", result);
});

const createSession = catchAsyncHandler(async (req: Request, res: Response) => {
  const result = await liveSessionService.createSession(req.body);
  sendResponse(res, 201, "Session created successfully", result);
});

const updateSession = catchAsyncHandler(async (req: Request, res: Response) => {
  const result = await liveSessionService.updateSession(req.params.id as string, req.body);
  sendResponse(res, 200, "Session updated successfully", result);
});

const deleteSession = catchAsyncHandler(async (req: Request, res: Response) => {
  const result = await liveSessionService.deleteSession(req.params.id as string);
  sendResponse(res, 200, "Session deleted successfully", result);
});

const getRegistrants = catchAsyncHandler(async (req: Request, res: Response) => {
  const result = await liveSessionService.getRegistrantsBySessionId(req.params.id as string);
  sendResponse(res, 200, "Registrants fetched successfully", result);
});

export const liveSessionController:LiveSessionController = {
  registerForSession,
  getAllSessions,
  getSessionById,
  createSession,
  updateSession,
  deleteSession,
  getRegistrants
};



type LiveSessionController = {
  registerForSession: RequestHandler;
  getAllSessions: RequestHandler;
  getSessionById: RequestHandler;
  createSession: RequestHandler;
  updateSession: RequestHandler;
  deleteSession: RequestHandler;
  getRegistrants: RequestHandler;
}
//  ====================
//  Live Session Controller
// ====================

import { Request, RequestHandler, Response } from "express";
import { liveSessionService } from "../services/liveSession.service";
import { catchAsyncHandler } from "../utils/catchAsyncHandler";
import { sendResponse } from "../utils/sendResponse";
import { notificationService } from "../services/notification.service";

// ============================== REGISTER For Session ==============================
const registerForSession = catchAsyncHandler(async (req: Request, res: Response) => {
  const result = await liveSessionService.registerForSession(req.body);

  try {
    // 🔒 SECURITY FIX: Only notify admin about session registration
    await notificationService.notifyAdmin({
      message: "🎟️ A student registered for a live session!",
      type: "info",
      data: { sessionId: req.body.sessionId, studentEmail: req.body.email }
    });
  } catch (_err) {
    // Socket emit failed, ignore for now
  }

  sendResponse(res, 201, "Registration successful", result);
});

// ============================== GET ALL Sessions ==============================
const getAllSessions = catchAsyncHandler(async (req: Request, res: Response) => {
  const result = await liveSessionService.getAllSessions(req.query);
  sendResponse(res, 200, "Sessions fetched successfully", result);
});

// ============================== GET Session By ID ==============================
const getSessionById = catchAsyncHandler(async (req: Request, res: Response) => {
  const result = await liveSessionService.getSessionById(req.params.id as string);
  sendResponse(res, 200, "Session fetched successfully", result);
});

// ============================== CREATE Session ==============================
const createSession = catchAsyncHandler(async (req: Request, res: Response) => {
  const result = await liveSessionService.createSession(req.body);

  try {
    // 🔒 SECURITY FIX: Only notify students and admin about new session
    await notificationService.notifyRole("student", {
      message: "🎥 A new live session has been scheduled!",
      type: "success",
      data: { sessionId: result.id }
    });
    await notificationService.notifyAdmin({
      message: "🎥 A new live session has been created!",
      type: "success",
      data: { sessionId: result.id, instructorId: req.user?.id }
    });
  } catch (_err) {
    // Socket emit failed, ignore for now
  }

  sendResponse(res, 201, "Session created successfully", result);
});

// ============================== UPDATE Session ==============================
const updateSession = catchAsyncHandler(async (req: Request, res: Response) => {
  const result = await liveSessionService.updateSession(req.params.id as string, req.body);
  sendResponse(res, 200, "Session updated successfully", result);
});

// ============================== DELETE Session ==============================
const deleteSession = catchAsyncHandler(async (req: Request, res: Response) => {
  const result = await liveSessionService.deleteSession(req.params.id as string);
  sendResponse(res, 200, "Session deleted successfully", result);
});

// ============================== GET Registrants ==============================
const getRegistrants = catchAsyncHandler(async (req: Request, res: Response) => {
  const result = await liveSessionService.getRegistrantsBySessionId(req.params.id as string, req.query);
  sendResponse(res, 200, "Registrants fetched successfully", result);
});

export const liveSessionController: LiveSessionController = {
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
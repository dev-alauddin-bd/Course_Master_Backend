//  ====================
//      AI Controller
// ====================

import { Request, RequestHandler, Response } from "express";
import { AiService } from "../services/ai.service";
import { catchAsyncHandler } from "../utils/catchAsyncHandler";
import { sendResponse } from "../utils/sendResponse";

// ============================== CHAT Assistant (SSE) ==============================
const chatAssistant = async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;

    // Set headers for SSE
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const stream = await AiService.chatAssistant(message, history || []);

    for await (const chunk of stream) {
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    }

    res.write(`data: [DONE]\n\n`);
    res.end();
  } catch (error: any) {
    console.error("Chat Controller Error:", error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
};

// ============================== GENERATE Quiz ==============================
const generateQuiz = catchAsyncHandler(async (req: Request, res: Response) => {
  const { lessonId } = req.params;
  const quiz = await AiService.generateQuiz(lessonId as string);
  sendResponse(res, 200, "Quiz generated successfully", quiz);
});

export const AiController: AIController = {
  chatAssistant,
  generateQuiz,
};


type AIController = {
  chatAssistant: RequestHandler;
  generateQuiz: RequestHandler;
};
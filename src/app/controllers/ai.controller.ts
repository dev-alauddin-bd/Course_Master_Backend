import { Request, Response } from "express";
import { AiService } from "../services/ai.service";


// ===================================== Chat Assistant ============================
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


// =================================================== Generate Quiz =====================================
const generateQuiz = async (req: Request, res: Response) => {
  try {
    const { lessonId } = req.params;
    const quiz = await AiService.generateQuiz(lessonId as string);
    res.json({ success: true, data: quiz });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const AiController = {
  chatAssistant,
  generateQuiz,


};

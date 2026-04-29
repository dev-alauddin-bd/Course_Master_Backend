import { Request, Response } from "express";
import { AiService } from "../services/ai.service";

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

const generateQuiz = async (req: Request, res: Response) => {
  try {
    const { lessonId } = req.params;
    const quiz = await AiService.generateQuiz(lessonId as string);
    res.json({ success: true, data: quiz });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const searchAssistant = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;
    const result = await AiService.searchAssistant(query as string);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getRecommendations = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id; 
    const recommendations = await AiService.getRecommendations(userId as string);
    res.json({ success: true, data: recommendations });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const AiController = {
  chatAssistant,
  generateQuiz,
  searchAssistant,
  getRecommendations,
};

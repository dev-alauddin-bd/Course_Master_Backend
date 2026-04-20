import { Request, Response } from "express";
import { AiService } from "../services/ai.service";

const chatAssistant = async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;
    console.log("Chat Request:", { message, historyLength: history?.length });
    const response = await AiService.chatAssistant(message, history || []);
    res.json({ success: true, data: response });
  } catch (error: any) {
    console.error("Chat Controller Error:", error);
    res.status(500).json({ success: false, message: error.message });
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

// src/utils/catchAsyncHandler.ts
import { Request, Response, NextFunction, RequestHandler } from "express";

export const catchAsyncHandler = <T>(fn: (_req: Request, _res: Response, _next: NextFunction) => Promise<T>): RequestHandler => {
  return (req, res, next) => {
    fn(req, res, next).catch(next); // errors forwarded to globalErrorHandler
  };
};

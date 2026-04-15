import { NextFunction, Request, Response } from "express";
import { CustomAppError } from "../errors/customError";
import { ZodError } from "zod";
import { prisma } from "../../lib/prisma";
import { Prisma } from "@prisma/client";
import logger from "../../lib/logger";

const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = "Something went wrong!";
  let errorSources: { path: string; message: string }[] = [
    {
      path: "",
      message: err.message || "Internal Server Error",
    },
  ];
  logger.error("Global error handler caught an error:", err);
  // ========================
  // 1. Custom Application Error
  // ========================
  if (err instanceof CustomAppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorSources = [{ path: "", message: err.message }];
  }

  // ========================
  // 2. Zod Validation Error
  // ========================
  else if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation Error";
    errorSources = err.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));
  }

  // ========================
  // 3. Prisma Known Request Error
  // ========================
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    statusCode = 400;
    
    // Unique constraint violation (e.g., duplicate email)
    if (err.code === "P2002") {
      const field = (err.meta?.target as string[])?.join(", ") || "field";
      message = `Duplicate value error: ${field} already exists.`;
      errorSources = [{ path: field, message }];
    } 
    // Record not found
    else if (err.code === "P2025") {
      statusCode = 404;
      message = "Record not found in the database.";
      errorSources = [{ path: "", message }];
    }
    // Foreign key constraint failure
    else if (err.code === "P2003") {
      message = "Constraint failure: A related record is missing or restricted.";
      errorSources = [{ path: "", message }];
    }
    else {
      message = `Database Error: ${err.message}`;
      errorSources = [{ path: err.code || "", message: err.message }];
    }
  }

  // ========================
  // 4. Prisma Validation Error
  // ========================
  else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = "Invalid data provided to the database. Check your fields.";
    errorSources = [{ path: "", message: err.message }];
  }

  // ========================
  // Final Response
  // ========================
  res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    // stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

export default globalErrorHandler;

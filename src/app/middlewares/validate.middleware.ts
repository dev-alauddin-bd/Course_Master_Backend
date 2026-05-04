import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

/**
 * Generic Zod validation middleware factory.
 * Validates `req.body` against the provided schema.
 * Returns a 400 with structured errors on failure.
 *
 * Usage:
 *   router.post("/signup", validate(signupValidation), authControllers.signup);
 */
export const validate =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = (result.error as ZodError).issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }));

      res.status(400).json({
        success: false,
        message: "Validation Error",
        errors,
      });
      return;
    }

    // Overwrite body with the parsed (type-safe, stripped) data
    req.body = result.data;
    next();
  };

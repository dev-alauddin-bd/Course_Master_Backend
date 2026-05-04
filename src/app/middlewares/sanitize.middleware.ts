import { Request, Response, NextFunction } from "express";

/**
 * Recursively strips keys that start with "$" or contain "." from objects/arrays.
 * This prevents NoSQL/MongoDB-style operator injection (e.g. { "$gt": "" }).
 * Even though we use Prisma/PostgreSQL, it is a good defence-in-depth practice.
 */
function deepSanitize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(deepSanitize);
  }

  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([key]) => !key.startsWith("$") && !key.includes("."))
        .map(([key, val]) => [key, deepSanitize(val)])
    );
  }

  // Sanitize string values: strip null bytes which can cause issues downstream
  if (typeof value === "string") {
    return value.replace(/\0/g, "");
  }

  return value;
}

/**
 * Express middleware that sanitizes `req.body`, `req.query`, and `req.params`
 * against operator-injection and null-byte attacks.
 *
 * Apply globally in index.ts after express.json():
 *   app.use(sanitizeRequest);
 */
export const sanitizeRequest = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (req.body) {
    req.body = deepSanitize(req.body);
  }
  if (req.query && typeof req.query === "object") {
    // req.query is a read-only getter in Express v5/router v2 — mutate in-place
    const sanitized = deepSanitize(req.query) as Record<string, unknown>;
    Object.keys(req.query).forEach((k) => delete (req.query as Record<string, unknown>)[k]);
    Object.assign(req.query, sanitized);
  }
  if (req.params && typeof req.params === "object") {
    // req.params is also a read-only getter — mutate in-place
    const sanitized = deepSanitize(req.params) as Record<string, string>;
    Object.keys(req.params).forEach((k) => delete req.params[k]);
    Object.assign(req.params, sanitized);
  }
  next();
};

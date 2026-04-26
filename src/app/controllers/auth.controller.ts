import { Request, RequestHandler, Response } from "express";
import { catchAsyncHandler } from "../utils/catchAsyncHandler";
import { authServices } from "../services/auth.service";
import { loginValidation, signupValidation } from "../validations/auth.validation";
import { IUser, IUserLogin } from "../interfaces/user.interface";

import { generateTokens } from "../utils/generateTokens";
import { setRefreshTokenCookie } from "../utils/cookie";
import { sendResponse } from "../utils/sendResponse";

/**
 * Handle new student or admin registration
 */
const signup = catchAsyncHandler(async (req: Request, res: Response) => {
  // Validate raw request body against Zod schema
  const validated = signupValidation.parse(req.body);
  
  // Persist user to PostgreSQL
  const user = await authServices.signup(validated as IUser);

  const payload : { id: string; email: string; role: string } = {
    id: user.id,
    email: user.email,
    role: user.role,
  };
  const { accessToken, refreshToken } = generateTokens(payload);
 
  // Set the refresh token as a secure httpOnly cookie
  setRefreshTokenCookie(res, refreshToken);

  // Send success response with created user and access token
  sendResponse(res, 201, "User registered successfully", { user, accessToken });
});

/**
 * Handle student/admin login and session creation
 */
const login = catchAsyncHandler(async (req: Request, res: Response) => {
  // Validate incoming credentials
  const validated = loginValidation.parse(req.body);
  
  // Verify credentials against database records
  const user = await authServices.login(validated as IUserLogin);

  // Issue identification tokens
  // token payload includes user ID, email, and role for authorization purposes
  const payload : { id: string; email: string; role: string } = {
    id: user.id,
    email: user.email,
    role: user.role,
  };
  const { accessToken, refreshToken } = generateTokens(payload);
  
  // Store session persistencer via secure cookie
  setRefreshTokenCookie(res, refreshToken);

  // Respond with authenticated user data
  sendResponse(res, 200, "User logged in successfully", { user, accessToken });
});

// ==============================
// REFRESH TOKEN CONTROLLER
// ==============================
const refreshToken = catchAsyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  const { accessToken } = await authServices.refreshToken(token);

  sendResponse(res, 200, "Access token refreshed", { accessToken });
});

// ==============================
// LOGOUT CONTROLLER
// ==============================
const logout = catchAsyncHandler(async (req: Request, res: Response) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  sendResponse(res, 200, "Logged out successfully");
});

const syncFirebase = catchAsyncHandler(async (req: Request, res: Response) => {
  const user = await authServices.syncFirebase(req.body);

  const payload: { id: string; email: string; role: string } = {
    id: user.id,
    email: user.email,
    role: user.role,
  };
  const { accessToken, refreshToken } = generateTokens(payload);
  setRefreshTokenCookie(res, refreshToken);

  sendResponse(res, 200, "Firebase user synced successfully", { user, accessToken });
});

export const authControllers: AuthControllers = {
  signup,
  login,
  refreshToken,
  logout,
  syncFirebase,
};

type AuthControllers = {
  signup: RequestHandler;
  login: RequestHandler;
  refreshToken: RequestHandler;
  logout: RequestHandler;
  syncFirebase: RequestHandler;
};
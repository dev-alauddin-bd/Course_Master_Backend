//  ====================
//     Auth Controller
// ====================

import { Request, RequestHandler, Response } from "express";
import { catchAsyncHandler } from "../utils/catchAsyncHandler";
import { authServices } from "../services/auth.service";
import { IUser, IUserLogin } from "../interfaces/user.interface";
import { generateTokens } from "../utils/generateTokens";
import { setRefreshTokenCookie, clearRefreshTokenCookie } from "../utils/cookie";
import { sendResponse } from "../utils/sendResponse";

// ============================== SIGNUP ==============================
const signup = catchAsyncHandler(async (req: Request, res: Response) => {
  // req.body is already validated & transformed by validate(signupValidation) middleware
  const user = await authServices.signup(req.body as IUser);

  const payload: { id: string; email: string; role: string } = {
    id: user.id,
    email: user.email,
    role: user.role,
  };
  const { accessToken, refreshToken } = generateTokens(payload);
  setRefreshTokenCookie(res, refreshToken);

 
  sendResponse(res, 201, "User registered successfully", { user, accessToken });
});

// ============================== LOGIN ==============================
const login = catchAsyncHandler(async (req: Request, res: Response) => {
  // req.body is already validated by validate(loginValidation) middleware
  const user = await authServices.login(req.body as IUserLogin);

  const payload: { id: string; email: string; role: string } = {
    id: user.id,
    email: user.email,
    role: user.role,
  };
  const { accessToken, refreshToken } = generateTokens(payload);
  setRefreshTokenCookie(res, refreshToken);

  sendResponse(res, 200, "User logged in successfully", { user, accessToken });
});

// ============================== REFRESH Token ==============================
const refreshToken = catchAsyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  const { accessToken } = await authServices.refreshToken(token);
  sendResponse(res, 200, "Access token refreshed", { accessToken });
});

// ============================== LOGOUT ==============================
const logout = catchAsyncHandler(async (req: Request, res: Response) => {
  clearRefreshTokenCookie(res);
  sendResponse(res, 200, "Logged out successfully");
});

// ============================== SYNC Firebase ==============================
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

// ============================== VERIFY Session ==============================
const verifySession = catchAsyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  const user = await authServices.verifySession(token);
  sendResponse(res, 200, "Session verified", user);
});

export const authControllers: AuthControllers = {
  signup,
  login,
  refreshToken,
  logout,
  verifySession,
  syncFirebase,
};

type AuthControllers = {
  signup: RequestHandler;
  login: RequestHandler;
  refreshToken: RequestHandler;
  logout: RequestHandler;
  verifySession: RequestHandler;
  syncFirebase: RequestHandler;
};
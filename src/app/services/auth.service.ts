//  ====================
//      Auth Service
// ====================

import logger from "../../lib/logger";
import { CustomAppError } from "../errors/customError";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { IUser, IUserLogin, UserRole } from "../interfaces/user.interface";
import { prisma } from "../../lib/prisma";
import { Role } from "@prisma/client";

// ============================== SIGNUP ==============================
const signup = async (payload: IUser) => {
  logger.info("Received signup request for email:", payload.email);

  if (!payload.email) {
    throw new CustomAppError(400, "User email is missing in request data");
  }

  const existingUser = await prisma.user.findFirst({
    where: { email: payload.email },
  });

  if (existingUser) {
    throw new CustomAppError(400, "User with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(payload.password!, 12);
  const validRoles = ["student", "instructor", "admin"];
  const role = validRoles.includes(payload.role?.toLowerCase())
    ? payload.role.toLowerCase()
    : "student";

  const newUser = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      role: role as Role,
    },
  });

  const { password: _password, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

// ============================== LOGIN ==============================
const login = async (payload: IUserLogin) => {
  if (!payload.email) {
    throw new CustomAppError(400, "User email is missing in request data");
  }
  
  const user = await prisma.user.findFirst({
    where: { email: payload.email },
  });

  if (!user) {
    throw new CustomAppError(404, "User not found with this email");
  }

  const isMatch = await bcrypt.compare(payload.password, user.password);
  if (!isMatch) {
    throw new CustomAppError(401, "Invalid credentials, password doesn't match");
  }

  const { password: _password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

// ============================== REFRESH Token ==============================
const refreshToken = async (token: string) => {
  if (!token) {
    throw new CustomAppError(401, "No refresh token provided");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as {
      id: string;
      email: string;
      role: UserRole;
    };

    const newAccessToken = jwt.sign(
      { id: decoded.id, email: decoded.email, role: decoded.role },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    return { accessToken: newAccessToken };
  } catch (_error) {
    throw new CustomAppError(401, "Invalid or expired refresh token");
  }
};

// ============================== SYNC Firebase ==============================
const syncFirebase = async (payload: { email: string; name: string; avatar?: string }) => {
  let user = await prisma.user.findFirst({
    where: { email: payload.email },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        password: "", 
        role: "student",
        avatar: payload.avatar,
      },
    });
  } else if (payload.avatar && !user.avatar) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { avatar: payload.avatar },
    });
  }

  const { password: _password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const authServices = {
  signup,
  login,
  refreshToken,
  syncFirebase
};


import logger from "../../lib/logger";
import { CustomAppError } from "../errors/customError";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { IUser, IUserLogin, UserRole } from "../interfaces/user.interface";
import { prisma } from "../../lib/prisma";
import { Role } from "@prisma/client";

/**
 * Handle user registration (Sign-Up)
 * 
 * @param payload - User data including name, email, password, etc.
 * @returns The created user object without the password
 */
const signup = async (payload: IUser) => {
  logger.info("Received signup request with data:", payload);
  // Check if a user with the same email already exists
  if (!payload.email) {
    throw new CustomAppError(400, "User email is missing in request data");
  }

 
  const existingUser = await prisma.user.findFirst({
    where: { email: payload.email },
  });

  if (existingUser) {
    throw new CustomAppError(400, "User with this email already exists");
  }

  // Hash the password before saving for security
  const hashedPassword = await bcrypt.hash(payload.password!, 12);
  logger.info("Password hashed successfully for email:", { email: payload.email });
  // Create new user in PostgreSQL using Prisma

const validRoles = ["student", "instructor", "admin"];

const role = validRoles.includes(payload.role?.toLowerCase())
  ? payload.role.toLowerCase()
  : "student";
  const newUser = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      role:role as Role,
    },
  });


  logger.info("User created successfully with ID:", newUser.id);

  // Remove password from response object for security
  const { password, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

/**
 * Authenticate user (Login)
 * 
 * @param payload - User login credentials (email, password)
 * @returns The user object without password if authentication is successful
 */
const login = async (payload: IUserLogin) => {
  // Find user by email in PostgreSQL
  if (!payload.email) {
    throw new CustomAppError(400, "User email is missing in request data");
  }
  
  const user = await prisma.user.findFirst({
    where: { email: payload.email },
  });

  if (!user) {
    throw new CustomAppError(404, "User not found with this email");
  }

  // Compare provided password with the hashed password in the database
  const isMatch = await bcrypt.compare(payload.password, user.password);
  if (!isMatch) {
    throw new CustomAppError(401, "Invalid credentials, password doesn't match");
  }

  // Remove password before returning user data
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * Generate a new access token using a valid refresh token
 * 
 * @param token - The refresh token provided by the client
 * @returns A fresh access token
 */
const refreshToken = async (token: string) => {
  if (!token) {
    throw new CustomAppError(401, "No refresh token provided");
  }

  try {
    // Verify the provided refresh token
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as {
      id: string;
      email: string;
      role: UserRole;
    };

    // Generate a new access token with 1 hour expiration
    const newAccessToken = jwt.sign(
      { id: decoded.id, email: decoded.email, role: decoded.role },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    return { accessToken: newAccessToken };
  } catch (error) {
    // Handle JWT verification errors (expired or tampered)
    throw new CustomAppError(401, "Invalid or expired refresh token");
  }
};

/**
 * Sync Firebase user with local database
 */
const syncFirebase = async (payload: { email: string; name: string; avatar?: string }) => {
  let user = await prisma.user.findFirst({
    where: { email: payload.email },
  });

  if (!user) {
    // Create user if they don't exist
    user = await prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        password: "", // No password needed for social login
        role: "student",
        avatar: payload.avatar,
      },
    });
  } else if (payload.avatar && !user.avatar) {
    // Update avatar if missing
    user = await prisma.user.update({
      where: { id: user.id },
      data: { avatar: payload.avatar },
    });
  }

  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const authServices = {
  signup,
  login,
  refreshToken,
  syncFirebase,
};

import { Request, RequestHandler, Response } from "express";
import { catchAsyncHandler } from "../utils/catchAsyncHandler";
import { sendResponse } from "../utils/sendResponse";
import { userService } from "../services/user.service";

const getAllUsers = catchAsyncHandler(
  async (req: Request, res: Response) => {
    const users = await userService.getAllUsers();
    sendResponse(res, 200, "Users retrieved successfully", users);
  }
);

 const becomeInstructor = catchAsyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    await userService.becomeInstructor(userId);
    sendResponse(res, 200, "Success: You are now an instructor!");
  }
);

const updateProfile = catchAsyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { name } = req.body;
    let avatarUrl;

    if (req.file) {
      avatarUrl = (req.file as any).path; // Cloudinary URL automatically returned by storage
    }

    const updatedUser = await userService.updateProfile(userId, {
      name,
      ...(avatarUrl && { avatar: avatarUrl }),
    });

    sendResponse(res, 200, "Profile updated successfully", updatedUser);
  }
);


export const userController: UserController = {
  getAllUsers,
  becomeInstructor,
  updateProfile,
};

type UserController = {
  getAllUsers: RequestHandler;
  becomeInstructor: RequestHandler;
  updateProfile: RequestHandler;
}
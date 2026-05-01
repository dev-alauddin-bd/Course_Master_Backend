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

const updateUserRole = catchAsyncHandler(
    async (req: Request, res: Response) => {
      const { id } = req.params;
      const { role } = req.body;
      const user = await userService.updateUserRole(id as string, role);
      sendResponse(res, 200, "User role updated successfully", user);
    }
  );
  
  const updateUserStatus = catchAsyncHandler(
    async (req: Request, res: Response) => {
      const { id } = req.params;
      const { status } = req.body;
      const user = await userService.updateUserStatus(id as string, status);
      sendResponse(res, 200, "User status updated successfully", user);
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
  updateUserRole,
  updateUserStatus,
  becomeInstructor,
  updateProfile,
};

type UserController = {
  getAllUsers: RequestHandler;
  updateUserRole: RequestHandler;
  updateUserStatus: RequestHandler;
  becomeInstructor: RequestHandler;
  updateProfile: RequestHandler;
}
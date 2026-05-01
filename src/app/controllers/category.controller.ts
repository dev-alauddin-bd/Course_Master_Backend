//  ====================
//    Category Controller
// ====================

import { Request, RequestHandler, Response } from "express";
import { catchAsyncHandler } from "../utils/catchAsyncHandler";
import { categoryService } from "../services/category.service";
import { sendResponse } from "../utils/sendResponse";

// ============================== GET ALL Categories ==============================
const getCategories = catchAsyncHandler(async (req: Request, res: Response) => {
  const categories = await categoryService.getAllCategories(req.query);
  sendResponse(res, 200, "Categories fetched successfully", categories);
});

// ============================== CREATE Category ==============================
const createCategory = catchAsyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.createCategory(req.body);
  sendResponse(res, 201, "Category created successfully", category);
});

// ============================== UPDATE Category ==============================
const updateCategory = catchAsyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.updateCategory(req.params.id as string, req.body);
  sendResponse(res, 200, "Category updated successfully", category);
});

// ============================== DELETE Category ==============================
const deleteCategory = catchAsyncHandler(async (req: Request, res: Response) => {
  const result = await categoryService.deleteCategory(req.params.id as string);
  sendResponse(res, 200, "Category deleted successfully", result);
});

export const categoryController: CategoryController = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};

type CategoryController = {
  getCategories: RequestHandler;
  createCategory: RequestHandler;
  updateCategory: RequestHandler;
  deleteCategory: RequestHandler;
}
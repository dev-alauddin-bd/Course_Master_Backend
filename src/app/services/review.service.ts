import { prisma } from "../../lib/prisma";

const createReview = async (payload: { content: string; rating: number; userId: string; courseId: string }) => {
  const { userId, courseId } = payload;

  // 1. Check if user is enrolled
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: { userId, courseId }
    }
  });

  if (!enrollment) {
    throw new Error("You must be enrolled in this course to leave a review.");
  }

  // 2. Check if user already reviewed
  const existingReview = await prisma.review.findFirst({
    where: { userId, courseId }
  });

  if (existingReview) {
    throw new Error("You have already reviewed this course.");
  }

  return await prisma.review.create({
    data: payload,
    include: {
      user: {
        select: { name: true, avatar: true, role: true }
      }
    }
  });
};

const getAllReviews = async () => {
  return await prisma.review.findMany({
   
    include: {
      user: {
        select: { name: true, avatar: true, role: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });
};

const deleteReview = async (id: string, userId: string) => {
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) throw new Error("Review not found");
  if (review.userId !== userId) throw new Error("Unauthorized");

  return await prisma.review.delete({ where: { id } });
};

export const reviewService = {
  createReview,
  getAllReviews,
  deleteReview
};

import { prisma } from "../../lib/prisma";

const createReview = async (payload: { content: string; rating: number; userId: string; courseId: string }) => {
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
    where: { isPublished: true },
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

//  ====================
//     Review Service
// ====================

import { prisma } from "../../lib/prisma";

export const reviewService = {
  // ============================== CREATE Review ==============================
  async createReview(payload: { content: string; rating: number; userId: string; courseId: string }) {
    const { userId, courseId } = payload;

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } }
    });

    if (!enrollment) {
      throw new Error("You must be enrolled in this course to leave a review.");
    }

    const existingReview = await prisma.review.findFirst({
      where: { userId, courseId }
    });

    if (existingReview) {
      throw new Error("You have already reviewed this course.");
    }

    return await prisma.review.create({
      data: payload,
      include: {
        user: { select: { name: true, avatar: true, role: true } }
      }
    });
  },

  // ============================== GET ALL Reviews ==============================
  async getAllReviews() {
    return await prisma.review.findMany({
      include: {
        user: { select: { name: true, avatar: true, role: true } }
      },
      orderBy: { createdAt: "desc" }
    });
  },

  // ============================== DELETE Review ==============================
  async deleteReview(id: string, userId: string) {
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) throw new Error("Review not found");
    if (review.userId !== userId) throw new Error("Unauthorized");

    return await prisma.review.delete({ where: { id } });
  },
};

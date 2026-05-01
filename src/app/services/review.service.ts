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
      select: {
        id: true,
        content: true,
        rating: true,
        createdAt: true,
        user: { select: { name: true, avatar: true, role: true } }
      }
    });
  },

  async getAllReviews(query: any = {}) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        select: {
          id: true,
          content: true,
          rating: true,
          createdAt: true,
          user: { select: { name: true, avatar: true, role: true } }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.review.count()
    ]);

    return {
      reviews,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  },

  // ============================== DELETE Review ==============================
  async deleteReview(id: string, userId: string) {
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) throw new Error("Review not found");
    if (review.userId !== userId) throw new Error("Unauthorized");

    return await prisma.review.delete({ where: { id } });
  },
};

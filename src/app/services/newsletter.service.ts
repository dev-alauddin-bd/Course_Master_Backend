//  ====================
//      Newsletter Service
// ====================

import { prisma } from "../../lib/prisma";

export const newsletterService = {
  // ============================== SUBSCRIBE ==============================
  async subscribe(email: string) {
    return await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: {}, // If already exists, do nothing
      create: { email },
    });
  },

  // ============================== GET ALL Subscribers ==============================
  async getAllSubscribers(query: any) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const [subscribers, total] = await Promise.all([
      prisma.newsletterSubscriber.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.newsletterSubscriber.count(),
    ]);

    return {
      subscribers,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  },

  // ============================== DELETE Subscriber ==============================
  async deleteSubscriber(id: string) {
    return await prisma.newsletterSubscriber.delete({
      where: { id },
    });
  },
};

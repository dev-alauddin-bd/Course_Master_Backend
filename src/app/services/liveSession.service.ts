//  ====================
//   Live Session Service
// ====================

import { prisma } from "../../lib/prisma";
import { CustomAppError } from "../errors/customError";

export const liveSessionService = {
  // ============================== REGISTER For Session ==============================
  async registerForSession(payload: { sessionId: string; name: string; email: string; phone: string }) {
    const session = await prisma.liveSession.findUnique({
      where: { id: payload.sessionId }
    });

    if (!session) {
      throw new CustomAppError(404, "Session not found");
    }

    // Check deadline
    if (new Date() > new Date(session.registrationDeadline)) {
      throw new CustomAppError(400, "Registration deadline has passed");
    }

    return await prisma.liveRegistration.create({
      data: payload
    });
  },

  // ============================== GET ALL Sessions ==============================
  async getAllSessions(query: any = {}) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where = { isPublished: true };

    const [sessions, total] = await Promise.all([
      prisma.liveSession.findMany({
        where,
        orderBy: { sessionDate: 'asc' },
        skip,
        take: limit,
      }),
      prisma.liveSession.count({ where })
    ]);

    return {
      sessions,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  },

  // ============================== GET Session By ID ==============================
  async getSessionById(id: string) {
    const session = await prisma.liveSession.findUnique({
      where: { id }
    });
    if (!session) {
      throw new CustomAppError(404, "Session not found");
    }
    return session;
  },

  // ============================== CREATE Session ==============================
  async createSession(payload: any) {
    return await prisma.liveSession.create({
      data: payload
    });
  },

  // ============================== UPDATE Session ==============================
  async updateSession(id: string, payload: any) {
    return await prisma.liveSession.update({
      where: { id },
      data: payload
    });
  },

  // ============================== DELETE Session ==============================
  async deleteSession(id: string) {
    await prisma.liveSession.delete({
      where: { id }
    });
    return { message: "Session deleted successfully" };
  },

  // ============================== GET Registrants ==============================
  async getRegistrantsBySessionId(sessionId: string, query: any = {}) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where = { sessionId };

    const [registrants, total] = await Promise.all([
      prisma.liveRegistration.findMany({
        where,
        orderBy: { registeredAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.liveRegistration.count({ where })
    ]);

    return {
      registrants,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  },
};

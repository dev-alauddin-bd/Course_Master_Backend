import { prisma } from "../../lib/prisma";
import { CustomAppError } from "../errors/customError";

const registerForSession = async (payload: { sessionId: string; name: string; email: string; phone: string }) => {
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

  // Register
  const result = await prisma.liveRegistration.create({
    data: payload
  });

  return result;
};

const getAllSessions = async () => {
  const sessions = await prisma.liveSession.findMany({
    where: { isPublished: true },
    orderBy: { sessionDate: 'asc' }
  });
  return sessions;
};

const getSessionById = async (id: string) => {
  const session = await prisma.liveSession.findUnique({
    where: { id }
  });
  if (!session) {
    throw new CustomAppError(404, "Session not found");
  }
  return session;
};

const createSession = async (payload: any) => {
  return await prisma.liveSession.create({
    data: payload
  });
};

const updateSession = async (id: string, payload: any) => {
  return await prisma.liveSession.update({
    where: { id },
    data: payload
  });
};

const deleteSession = async (id: string) => {
  await prisma.liveSession.delete({
    where: { id }
  });
  return { message: "Session deleted successfully" };
};

const getRegistrantsBySessionId = async (sessionId: string) => {
  return await prisma.liveRegistration.findMany({
    where: { sessionId },
    orderBy: { registeredAt: 'desc' }
  });
};

export const liveSessionService = {
  registerForSession,
  getAllSessions,
  getSessionById,
  createSession,
  updateSession,
  deleteSession,
  getRegistrantsBySessionId
};

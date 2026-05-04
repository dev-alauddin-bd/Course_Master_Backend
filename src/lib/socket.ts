import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import logger from "./logger";

// Store Socket.IO instance
let io: Server | null = null;

/** Allowed roles */
const ALLOWED_ROLES = new Set(["student", "instructor", "admin", "guest"]);

/**
 * Initialize Socket.IO
 */
export const initSocket = (server: HttpServer): Server => {
  const allowedOrigin =
    process.env.FRONTEND_URL ??
    (process.env.NODE_ENV !== "production"
      ? "http://localhost:3000"
      : undefined);

  if (!allowedOrigin) {
    throw new Error(
      "[Security] FRONTEND_URL env var must be set in production for Socket.IO CORS."
    );
  }

  io = new Server(server, {
    cors: {
      origin: allowedOrigin,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket: Socket) => {
    const rawRole =
      typeof socket.handshake.query.role === "string"
        ? socket.handshake.query.role
        : "guest";

    const role = ALLOWED_ROLES.has(rawRole) ? rawRole : "guest";

    socket.join(`role-${role}`);

    logger.info(
      `⚡ [Socket.IO] Connected: ${socket.id} (role: ${role})`
    );

    socket.on("disconnect", () => {
      logger.info(`🔌 [Socket.IO] Disconnected: ${socket.id}`);
    });
  });

  logger.info("📡 Socket.IO initialized!");
  return io;
};

/**
 * Get IO instance
 */
export const getIO = (): Server => {
  if (!io) {
    throw new Error("Socket.io not initialized! Call initSocket first.");
  }
  return io;
};

/**
 * Emit event to a specific role (Generic Type Safe)
 */
export const emitToRole = <T>(
  role: string,
  event: string,
  data: T
): void => {
  const io = getIO();
  io.to(`role-${role}`).emit(event, data);
};
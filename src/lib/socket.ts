import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import logger from "./logger";

// Create a global or module-level variable to store the Socket.IO instance.
// This allows us to reuse the exact same instance across controllers/services.
let io: Server | null = null;

/**
 * Initializes the Socket.IO server.
 * 
 * @param server - The native Node.js HTTP server (returned by app.listen)
 * @returns The initialized Socket.IO server instance
 */
export const initSocket = (server: HttpServer): Server => {
  io = new Server(server, {
    cors: {
      origin: "*", // In production, restrict this to your frontend URL
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    },
  });

  io.on("connection", (socket: Socket) => {
    logger.info(`⚡ [Socket.IO] New client connected: ${socket.id}`);

    // --- Developer Note ---
    // Here you can listen to global events.
    // However, it's often better to let your controllers handle specific logic
    // and use `getIO()` to emit events from anywhere in your backend.

    socket.on("disconnect", () => {
      logger.info(`🔌 [Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  logger.info("📡 Socket.IO server initialized successfully!");
  return io;
};

/**
 * Retrieves the initialized Socket.IO instance.
 * Throws an error if called before `initSocket()`.
 * 
 * @example
 * import { getIO } from "../lib/socket";
 * getIO().emit("new_notification", { message: "Hello!" });
 */
export const getIO = (): Server => {
  if (!io) {
    throw new Error("Socket.io not initialized! Call initSocket(server) first.");
  }
  return io;
};

import { Server } from "socket.io";
import type { Server as HttpServer } from "node:http";
import { socketAuthMiddleware } from "../middlewares/socket-auth-middleware.ts";
let io: Server;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL ?? [
        "http://localhost:5173",
        "http://localhost:3000",
      ],
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    },
  });

  io.use(socketAuthMiddleware);

  io.on("connection", (socket) => {
    console.log(`socket-connected:${socket.data.user.email}`);

    // Join the user's personal room so targeted notifications reach them.
    // notification-controller emits to "user:<userId>" — without this join
    // the room is always empty and no notification ever arrives on the client.
    socket.join(`user:${socket.data.userId}`);

    socket.on("disconnect", (reason) => {
      console.log(`Socket disconnected: ${socket.id}`, reason);
    });

    socket.on("ping-server", (message) => {
      console.log("Message from frontend:", message);

      socket.emit("pong-client", {
        message: "Hello from backend!",
        received: message,
      });
    });
  });

  return io;
};

export const getIo = (): Server => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized");
  }

  return io;
};

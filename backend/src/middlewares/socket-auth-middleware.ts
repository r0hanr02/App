import jwt  from "jsonwebtoken";
import type { Socket } from "socket.io";
import { User } from "../modules/auth/index.ts";

export const socketAuthMiddleware = async(socket:Socket,next: (err?: Error) => void,)=>{
     try {
    const token = socket.handshake.auth?.token;

    if (typeof token !== "string" || !token) {
      return next(new Error("Authentication required"));
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY!);

    if (
      typeof decoded === "string" ||
      typeof decoded.id !== "string"
    ) {
      return next(new Error("Invalid token"));
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new Error("User not found"));
    }

    socket.data.userId = user._id.toString();
    socket.data.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
    };

    next();
  } catch {
    next(new Error("Authentication failed"));
  }
}
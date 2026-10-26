import { io } from "socket.io-client";

// autoConnect: false — we connect manually in App.tsx AFTER the user
// is authenticated and we have an access token.  If autoConnect is left
// as the default (true) the socket fires a connection attempt at import
// time with no token, and the backend middleware immediately rejects it.
export const socket = io("http://localhost:8000", {
  withCredentials: true,
  autoConnect: false,
});

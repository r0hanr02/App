import { useEffect, useState } from "react";
import { socket } from "../../../lib/socket";

/**
 * Tracks the number of unread notifications received via the socket
 * since the last time `reset()` was called (e.g. when the user opens
 * the Notification page).
 */
export function useNotificationCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const handleNew = () => {
      setCount((prev) => prev + 1);
    };

    socket.on("notification:new", handleNew);
    return () => {
      socket.off("notification:new", handleNew);
    };
  }, []);

  const reset = () => setCount(0);

  return { count, reset };
}

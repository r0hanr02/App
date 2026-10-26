import { useEffect } from "react";
import { queryClient } from "../../../lib/queryClient";
import { socket } from "../../../lib/socket";

const Notification = () => {
  useEffect(() => {
    const handleNotification = (notification: Notification) => {
      queryClient.setQueryData<Notification[]>(
        ["notifications"],
        (old = []) => [notification, ...old],
      );
    };

    socket.on("notification:new", handleNotification);

    return () => {
      socket.off("notification:new", handleNotification);
    };
  }, []); // queryClient is a stable singleton — no need in deps array

  return <div>Notification</div>;
};

export default Notification;

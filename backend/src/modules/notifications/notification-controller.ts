import type mongoose from "mongoose";
import { getIo } from "../../utils/socket.ts";
import { Notification } from "./notification-model.ts";

export const createTaskAssignedNotification = async ({
  recipientId,
  taskId,
  taskTitle,
}: {
  recipientId: string;
  taskId: mongoose.Types.ObjectId;
  taskTitle: string;
}) => {
  const notification = await Notification.create({
    recipient: recipientId,
    type: "TASK_ASSIGNED",
    title: "New task assigned",
    message: `You have been assigned "${taskTitle}"`,
    taskId,
  });

  getIo().to(`user:${recipientId}`).emit("notification:new", notification);

  return notification;
};


export const createTaskCompletedNotification = async ({
  recipientId,
  taskId,
  taskTitle,
}: {
  recipientId: string;
  taskId: mongoose.Types.ObjectId;
  taskTitle: string;
}) => {
  const notification = await Notification.create({
    recipient: recipientId,
    type: "TASK_COMPLETED",
    title: "Task completed",
    message: `The task "${taskTitle}" has been completed`,
    taskId,
  });
  getIo().to(`user:${recipientId}`).emit("notification:new", notification);

  return notification;
};
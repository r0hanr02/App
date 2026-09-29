import mongoose from "mongoose";

export const VALID_TASK_STATUSES = [
  "TODO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "DONE",
  "CANCELLED",
] as const;

export const VALID_TASK_PRIORITIES = [
  "Low",
  "Medium",
  "High",
  "Critical",
] as const;

export const VALID_TASK_TYPES = [
  "Feature",
  "Bug",
  "Improvement",
  "Task",
  "Documentation",
] as const;
// 6ab0e2e0639d453131378573
const taskSchema = new mongoose.Schema(
  {
    task_name: {
      type: String,
      required: [true, "Task Name Is Required"],
      trim: true,
      minlength: [1, "Task Name Cannot Be Empty"],
      maxlength: [200, "Task Name Cannot Exceed 200 Characters"],
      validate: {
        validator: (value: string) => value.trim().length > 0,
        message: "Task Name Cannot Be Empty",
      },
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [5000, "Description Cannot Exceed 5000 Characters"],
    },
    status: {
      type: String,
      enum: {
        values: VALID_TASK_STATUSES,
        message: "Status must be one of: " + VALID_TASK_STATUSES.join(", "),
      },
      default: "TODO",
      required: [true, "Status Is Required"],
    },
    priority: {
      type: String,
      enum: {
        values: VALID_TASK_PRIORITIES,
        message: "Priority must be one of: " + VALID_TASK_PRIORITIES.join(", "),
      },
      default: "Medium",
      required: [true, "Priority Is Required"],
    },
    type: {
      type: String,
      enum: {
        values: VALID_TASK_TYPES,
        message: "Type must be one of: " + VALID_TASK_TYPES.join(", "),
      },
      default: "Task",
      required: [true, "Type Is Required"],
    },
    due_date: {
      type: Date,
      default: null,
    },
    project_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project Id Is Required"],
      index: true,
    },
    organization_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: [true, "Organization Id Is Required"],
      index: true,
    },
    creator_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator Id Is Required"],
    },
    assignee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    is_deleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

taskSchema.index({ organization_id: 1, project_id: 1 });
// Dashboard / filter: tasks by status/priority within tenant
taskSchema.index({ organization_id: 1, status: 1, priority: 1 });
// Assignee filter: "my tasks"
taskSchema.index({ organization_id: 1, assignee_id: 1 });
// Overdue / sorting by due date
taskSchema.index({ organization_id: 1, due_date: 1 });
// Soft-deletion scope
taskSchema.index({ organization_id: 1, is_deleted: 1 });
// Search task title/description
taskSchema.index({ task_name: "text", description: "text" });

export const Task = mongoose.model("Task", taskSchema);

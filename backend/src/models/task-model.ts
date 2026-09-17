import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    task_name: {
      type: String,
      required: [true, "Task Name Is Required"],
      trim: true,
      minlength: [1, "Task Name Cannot Be Empty"],
      validate: {
        validator: (value: string) => value.trim().length > 0,
        message: "Task Name Cannot Be Empty",
      },
    },
    project_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project Id is Required"],
      validate: {
        validator: async function (value: mongoose.Types.ObjectId) {
          const project = await mongoose.model("Project").findById(value);
          return project !== null;
        },
        message: "Referenced Project Does Not Exist",
      },
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export default mongoose.model("Task", taskSchema);
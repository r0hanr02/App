import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    project_name: {
      type: String,
      required: [true, "Project Name cannot be Empty"],
      trim: true,
      unique: true,
      validate: {
        validator: (value: string) => value.trim().length > 0,
        message: "Project Name cannot be empty",
      },
    },
    project_description:{
type: String,
 trim: true,
    },
    organization_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: [true, "Organization Id is Required"],
      validate: {
        validator: async function (value: mongoose.Types.ObjectId) {
          const organization = await mongoose
            .model("Organization")
            .findById(value);
          return organization !== null;
        },
        message: "Referenced Organization Does Not Exist",
      },
    },
  },
  {
    timestamps: true,
  }
);

export const Project = mongoose.model("Project", projectSchema);

const projectMemberSchema = new mongoose.Schema(
  {
    project_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project Id is Required"],
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User Id is Required"],
    },
  },
  {
    timestamps: true,
  }
);

projectMemberSchema.index({ project_id: 1, user_id: 1 }, { unique: true });

export const ProjectMember = mongoose.model(
  "ProjectMember",
  projectMemberSchema
);
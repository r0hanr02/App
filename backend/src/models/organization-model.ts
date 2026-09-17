import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
  {
    organization_name: {
      type: String,
      required: [true, "Organization Name is Required"],
      trim: true,
      validate: {
        validator: (value: string) => value.trim().length > 0,
        message: "Organization Name cannot be Empty",
      },
    },
    slug: {
      type: String,
      required: [true, "Slug is Required"],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (value: string) => value.trim().length > 0,
        message: "Slug cannot be Empty",
      },
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const Organization = mongoose.model(
  "Organization",
  organizationSchema
);

const VALID_ROLES = ["OWNER", "ADMIN", "MEMBER"] as const;

const orgMemberSchema = new mongoose.Schema(
  {
    organization_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: [true, "Organization is Required"],
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
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is Required"],
      validate: {
        validator: async function (value: mongoose.Types.ObjectId) {
          const user = await mongoose.model("User").findById(value);
          return user !== null;
        },
        message: "Referenced User Does Not Exist",
      },
    },
    role: {
      type: String,
      trim: true,
      enum: {
        values: VALID_ROLES,
        message: "Role must be one of: " + VALID_ROLES.join(", "),
      },
      required: [true, "Role is Required"],
    },
  },
  {
    timestamps: true,
  }
);

// A user cannot join the same organization twice
orgMemberSchema.index({ organization_id: 1, user_id: 1 }, { unique: true });

// Prevent removing/demoting the last remaining OWNER of an organization
// orgMemberSchema.pre(
//   "deleteOne",
//   { document: true, query: false },
//   async function (next) {
//     if (this.role === "OWNER") {
//       const otherOwners = await mongoose.model("OrganizationMember").countDocuments({
//         organization_id: this.organization_id,
//         role: "OWNER",
//         _id: { $ne: this._id },
//       });
//       if (otherOwners === 0) {
//         return next(
//           new Error("Cannot remove the last owner of an organization")
//         );
//       }
//     }
//     next();
//   }
// );

// orgMemberSchema.pre("save", async function (next) {
//   if (!this.isNew && this.isModified("role") && this.role !== "OWNER") {
//     const existing = await mongoose
//       .model("OrganizationMember")
//       .findById(this._id);
//     if (existing?.role === "OWNER") {
//       const otherOwners = await mongoose.model("OrganizationMember").countDocuments({
//         organization_id: this.organization_id,
//         role: "OWNER",
//         _id: { $ne: this._id },
//       });
//       if (otherOwners === 0) {
//         return next(
//           new Error("Cannot demote the last owner of an organization")
//         );
//       }
//     }
//   }
//   next();
// });

export const OrganizationMember = mongoose.model(
  "OrganizationMember",
  orgMemberSchema
);
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is Required"],
      trim: true,
      validate: {
        validator: (value: string) => value.trim().length > 0,
        message: "Name cannot be Empty",
      },
    },
    email: {
      type: String,
      required: [true, "Email is Required"],
      unique: true,
      trim: true,
      lowercase: true,
      validate: [
        {
          validator: (value: string) => value.trim().length > 0,
          message: "Email cannot be Empty",
        },
        {
          validator: (value: string) => /^\S+@\S+\.\S+$/.test(value),
          message: "Email must be a valid email address",
        },
      ],
    },
    password: {
      type: String,
      required: [true, "password is Required"],
      select: false,
      validate: {
        validator: (value: string) => value.length > 0,
        message: "Password cannot be Empty",
      },
    },
    phone: {
      type: String,
      required: false,
      trim: true,
      unique: true,
      sparse: true,
    },
    dateOfBirth: {
      type: String,
    },
    occupation: {
      type: String,
      trim: true,
      default: "",
    },
    profilepic: {
      type: String,
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model("User", userSchema);

// userSchema.pre

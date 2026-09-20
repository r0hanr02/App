import mongoose from "mongoose";

export const connectDb = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    // console.log("MONGODB_URI:", uri); // Log the value of MONGODB_URI for debugging
    if (!uri) {
      throw new Error(
        "MONGODB_URI is not defined in the environment variables"
      );
    }
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1)
  }
};

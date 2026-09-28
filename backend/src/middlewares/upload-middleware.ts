import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";


const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Re-apply config inside request execution guarantees process.env is populated
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_API_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    return {
      folder: "avatars",
      allowed_formats: ["jpg", "png", "jpeg", "webp"],
    };
  },
});
export const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
});

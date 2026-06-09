import type { UploadApiOptions, UploadApiResponse } from "cloudinary";
import streamifier from "streamifier";
import cloudinary from "./cloudinary";

export const uploadImage = (
  file: Express.Multer.File,
  folder: string,
  options: UploadApiOptions = {},
) =>
  new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        ...options,
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Cloudinary did not return a result"));
          return;
        }
        resolve(result);
      },
    );

    streamifier.createReadStream(file.buffer).pipe(stream);
  });

export const deleteImage = async (publicId?: string | null) => {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
};

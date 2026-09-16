import { CLOUDINARY_NAME } from "@/config";

/**
 * Cloudinary Upload Utility
 *
 * Handles inline image uploads to Cloudinary.
 * Uses unsigned upload preset for simplicity (MVP approach).
 */
const UPLOAD_PRESET = "unsigned_preset";

/**
 * Upload an image file to Cloudinary
 * @param file - Image file to upload
 * @returns Promise<string> - Cloudinary URL of uploaded image
 */
export async function uploadImageToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload image to Cloudinary");
  }
}

/**
 * Upload multiple images to Cloudinary
 * @param files - Array of image files to upload
 * @returns Promise<string[]> - Array of Cloudinary URLs
 */
export async function uploadImagesToCloudinary(
  files: File[],
): Promise<string[]> {
  const uploadPromises = files.map((file) => uploadImageToCloudinary(file));
  return Promise.all(uploadPromises);
}

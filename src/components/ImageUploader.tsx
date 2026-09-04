import { useState, useCallback } from "react";
import { Button,Input,Label,Card,CardContent,CardHeader,CardTitle,Progress } from "@oja/ui";
import { Upload, ImageIcon, Trash2, Star } from "lucide-react";
import { cn } from "@/lib/utils";

import { CLOUDINARY_NAME } from "@/config";

type UploadedImage = {
  url: string;
  public_id: string;
  isMain: boolean;
};

type ImageUploaderProps = {
  existingImages?: string[]; // urls from backend
  mainImageUrl?: string;
  onImagesChange: (urls: string[], mainUrl?: string) => void;
  maxImages?: number;
  // Add unique ID to prevent conflicts when multiple ImageUploaders are used
  // (e.g., one per variant in a form)
  uploaderId?: string;
};

export function ImageUploader({
  existingImages = [],
  mainImageUrl,
  onImagesChange,
  maxImages = 8,
  uploaderId = "image-upload", // Default ID for backward compatibility
}: ImageUploaderProps) {
  const [images, setImages] = useState<UploadedImage[]>(
    existingImages.map((url) => ({
      url,
      public_id: url.split("/").pop() || "",
      isMain: url === mainImageUrl,
    })),
  );

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadToCloudinary = useCallback(async (file: File) => {
    setUploading(true);
    setProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "unsigned_preset");

    try {
      // For unsigned upload (simpler but less secure)
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();

      setProgress(100);

      return {
        url: data.secure_url,
        public_id: data.public_id,
        isMain: false,
      };
    } catch (err) {
      setError((err as Error).message);
      return null;
    } finally {
      setUploading(false);
    }
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newImages: UploadedImage[] = [];

    for (const file of Array.from(files)) {
      if (images.length + newImages.length >= maxImages) break;
      const uploaded = await uploadToCloudinary(file);
      if (uploaded) newImages.push(uploaded);
    }

    if (newImages.length > 0) {
      const updated = [...images, ...newImages];

      // If no main image yet, make first one main
      if (!updated.some((img) => img.isMain) && updated.length > 0) {
        updated[0].isMain = true;
      }

      setImages(updated);
      notifyParent(updated);
    }

    // Reset the input so the same file can be uploaded again if needed
    e.target.value = "";
  };

  const setAsMain = (index: number) => {
    const updated = images.map((img, i) => ({
      ...img,
      isMain: i === index,
    }));
    setImages(updated);
    notifyParent(updated);
  };

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);

    // If removed main image, promote first remaining to main
    if (images[index].isMain && updated.length > 0) {
      updated[0].isMain = true;
    }

    setImages(updated);
    notifyParent(updated);
  };

  const notifyParent = (imgs: UploadedImage[]) => {
    const urls = imgs.map((i) => i.url);
    const main = imgs.find((i) => i.isMain)?.url;
    onImagesChange(urls, main);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Images</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload area */}
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            disabled={uploading || images.length >= maxImages}
            className="hidden"
            id={uploaderId} // Use unique ID here
          />
          <Label
            htmlFor={uploaderId} // Use unique ID here
            className={cn(
              "cursor-pointer flex flex-col items-center gap-2",
              (uploading || images.length >= maxImages) &&
                "opacity-50 cursor-not-allowed",
            )}
          >
            <Upload className="h-10 w-10 text-muted-foreground" />
            <div className="text-sm font-medium">
              Click to upload or drag & drop
            </div>
            <div className="text-xs text-muted-foreground">
              PNG, JPG, WebP up to 10MB each • Max {maxImages} images
            </div>
          </Label>
        </div>

        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {/* Image preview grid */}
        {images.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Click an image to set it as main. Hover to see actions.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((img, index) => (
                <div
                  key={img.public_id || index}
                  className={cn(
                    "relative group rounded-lg overflow-hidden border-2 transition-all",
                    img.isMain
                      ? "ring-2 ring-primary border-primary"
                      : "border-gray-200 hover:border-gray-300 cursor-pointer",
                  )}
                  onClick={() => !img.isMain && setAsMain(index)}
                >
                  <img
                    src={img.url}
                    alt="Product"
                    className="w-full h-40 object-cover"
                  />

                  {/* Overlay with delete button - shows on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all">
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering setAsMain
                          removeImage(index);
                        }}
                        className="h-8 w-8 p-0 shadow-lg"
                        type="button"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Main image badge */}
                  {img.isMain && (
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded flex items-center gap-1 shadow-lg">
                      <Star className="h-3 w-3 fill-current" />
                      Main
                    </div>
                  )}

                  {/* Click hint - shows on hover for non-main images */}
                  {!img.isMain && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="bg-white/90 text-gray-800 text-xs px-3 py-1.5 rounded shadow-lg">
                        Click to set as main
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {images.length === 0 && !uploading && (
          <div className="text-center py-8 text-muted-foreground">
            <ImageIcon className="mx-auto h-12 w-12 mb-2" />
            <p>No images uploaded yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

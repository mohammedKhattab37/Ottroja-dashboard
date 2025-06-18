import { useState, useCallback } from "react";
import { sdk } from "../lib/sdk";
import { AdminFile } from "@medusajs/framework/types";
import { IconButton, Input, Label } from "@medusajs/ui";
import { XMark, CircleArrowUp, Eye } from "@medusajs/icons";

export const ImageCMSModule = ({
  images,
  setImages,
}: {
  images: AdminFile[] | undefined;
  setImages: React.Dispatch<React.SetStateAction<AdminFile[] | undefined>>;
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<AdminFile>();

  // Handle file selection
  const handleFileSelect = useCallback(async (files: File[] | null) => {
    if (files == null) {
      return;
    }

    const fileArray = Array.from(files);
    const imageFiles = fileArray.filter((file) =>
      file.type.startsWith("image/")
    );

    if (imageFiles.length === 0) {
      alert("Please select valid image files");
      return;
    }

    setUploading(true);

    try {
      const uploadedImages = await sdk.admin.upload.create({
        files: imageFiles,
      });

      setImages((prev) => [...(prev ?? []), ...uploadedImages.files]);
    } catch (error) {
      console.log(error);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }, []);

  // Remove image
  const removeImage = async (id: string) => {
    await sdk.admin.upload.delete(id).then(({ deleted }) => {
      console.log(deleted);
    });
    setImages((prev) =>
      prev ? prev.filter((img: AdminFile) => img.id !== id) : undefined
    );
  };

  return (
    <div className="p-6">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          uploading
            ? "border-blue-400"
            : "border-white/50 hover:border-white/30"
        }`}
      >
        <CircleArrowUp className="justify-self-center mb-6 scale-[2.7]" />
        <div className="text-lg font-medium  mb-2">
          {uploading ? "Uploading..." : "Drop images here or click to select"}
        </div>
        <div className="text-sm text-gray-500 mb-4">
          Supports JPG, PNG, GIF, WebP formats
        </div>
        <Input
          type="file"
          multiple
          accept="image/*" //change
          name="cms-upload"
          onChange={(e) =>
            handleFileSelect(e.target.files ? Array.from(e.target.files) : null)
          }
          className="hidden"
          id="file-input"
          disabled={uploading}
        />
        <Label
          htmlFor="file-input"
          className={`inline-flex items-center px-4 py-2 shadow-buttons-neutral text-sm font-medium rounded-md text-white bg-ui-button-neutral ${
            uploading
              ? "shadow-none cursor-not-allowed"
              : "hover:bg-ui-button-neutral-hover shadow-buttons-neutral cursor-pointer"
          } transition-colors`}
        >
          {uploading ? "Uploading..." : "Select Images"}
        </Label>
      </div>

      {/* Images Grid */}
      {images && images.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              Uploaded Images ({images.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image) => (
              <div
                key={image.id}
                className={`relative group bg-gray-50 rounded-lg overflow-hidden border-2 transition-all border-gray-200 hover:shadow-md`}
              >
                {/* Image */}
                <div className="aspect-video relative overflow-hidden bg-gray-100">
                  <img
                    src={image.url}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />

                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex space-x-2">
                      <IconButton
                        type="button"
                        onClick={() => setPreviewImage(image)}
                        className="bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
                        title="Preview"
                      >
                        <Eye />
                      </IconButton>
                      <IconButton
                        type="button"
                        onClick={() => removeImage(image.id)}
                        className="bg-red-500/90 rounded-full hover:bg-red-500/100 transition-all"
                        title="Remove"
                      >
                        <XMark />
                      </IconButton>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {images && images.length === 0 && !uploading && (
        <div className="mt-8 text-center py-8">
          <p>No images uploaded yet</p>
        </div>
      )}

      {/* Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="relative max-w-4xl max-h-full">
            <IconButton
              type="button"
              onClick={() => setPreviewImage(undefined)}
              className="absolute top-4 right-4 rounded-full  z-10"
            >
              <XMark />
            </IconButton>
            <img
              src={previewImage.url}
              alt={previewImage.id}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageCMSModule;

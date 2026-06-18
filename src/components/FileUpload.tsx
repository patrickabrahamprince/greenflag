"use client";
import { useState, useRef } from "react";
import { Upload, Camera, Video } from "lucide-react";
import { uploadPhoto } from "@/lib/storage";

interface FileUploadProps {
  onUpload: (url: string) => void;
  bucket?: "photos" | "proofs";
  userId?: string;
  className?: string;
  children?: React.ReactNode;
  mediaType?: "image" | "video";
}

export default function FileUpload({
  onUpload,
  bucket = "photos",
  userId,
  className = "",
  children,
  mediaType = "image",
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const uid = userId || "anonymous";
      const url = await uploadPhoto(file, bucket, uid);
      if (url) {
        onUpload(url);
      } else {
        alert("Upload failed. Please check your connection and try again.");
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      alert(err.message || "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const Icon = mediaType === "video" ? Video : Camera;

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={mediaType === "video" ? "video/*" : "image/*"}
        capture={mediaType === "video" ? "environment" : "environment"}
        onChange={handleChange}
        className="hidden"
      />
      <div onClick={() => inputRef.current?.click()} className={className}>
        {children || (
          <div className="w-full h-full flex items-center justify-center">
            {uploading ? (
              <div className="w-5 h-5 rounded-full border-[1.5px] border-accent/30 border-t-accent animate-spin" />
            ) : (
              <Icon className="w-6 h-6 text-text-muted" strokeWidth={1.5} />
            )}
          </div>
        )}
      </div>
    </>
  );
}

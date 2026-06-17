"use client";
import { useState, useRef } from "react";
import { Upload } from "lucide-react";
import { uploadPhoto } from "@/lib/storage";

interface FileUploadProps {
  onUpload: (url: string) => void;
  bucket?: "photos" | "proofs";
  userId?: string;
  className?: string;
  children?: React.ReactNode;
}

export default function FileUpload({
  onUpload,
  bucket = "photos",
  userId,
  className = "",
  children,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const uid = userId || "anonymous";
    const url = await uploadPhoto(file, bucket, uid);
    setUploading(false);

    if (url) onUpload(url);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
      <div onClick={() => inputRef.current?.click()} className={className}>
        {children || (
          <div className="w-full h-full flex items-center justify-center">
            {uploading ? (
              <div className="w-5 h-5 rounded-full border-[1.5px] border-accent/30 border-t-accent animate-spin" />
            ) : (
              <Upload className="w-6 h-6 text-text-muted" strokeWidth={1.5} />
            )}
          </div>
        )}
      </div>
    </>
  );
}

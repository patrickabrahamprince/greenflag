"use client";
import { useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface ImageLightboxProps {
  images: string[];
  index: number;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

export default function ImageLightbox({ images, index, onClose, onPrev, onNext }: ImageLightboxProps) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && onPrev) onPrev();
      if (e.key === "ArrowRight" && onNext) onNext();
    };
    window.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handler);
    };
  }, [onClose, onPrev, onNext]);

  return (
    <div className="fixed inset-0 z-[200] bg-bg/95 backdrop-blur-xl flex items-center justify-center animate-fade-in">
      <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-surface-elevated border-[0.5px] border-border flex items-center justify-center z-10">
        <X className="w-5 h-5 text-text" strokeWidth={1.5} />
      </button>

      {images.length > 1 && onPrev && (
        <button onClick={onPrev} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-surface-elevated border-[0.5px] border-border flex items-center justify-center z-10">
          <ChevronLeft className="w-5 h-5 text-text" strokeWidth={1.5} />
        </button>
      )}

      <img src={images[index]} alt="" className="max-h-[85vh] max-w-[90vw] object-contain rounded-[24px]" />

      {images.length > 1 && onNext && (
        <button onClick={onNext} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-surface-elevated border-[0.5px] border-border flex items-center justify-center z-10">
          <ChevronRight className="w-5 h-5 text-text" strokeWidth={1.5} />
        </button>
      )}

      {images.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === index ? "bg-accent w-4" : "bg-border"}`} />
          ))}
        </div>
      )}
    </div>
  );
}

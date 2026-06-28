// /hooks/useImageCrop.ts

'use client';

import { useState, useCallback } from 'react';
import type { Point, Area } from 'react-easy-crop';

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

async function getCroppedImgBlob(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  // Force output size to 1080x1080 square
  canvas.width = 1080;
  canvas.height = 1080;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    1080,
    1080
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        resolve(blob);
      },
      'image/jpeg',
      0.8
    );
  });
}

export function useImageCrop() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const setImage = useCallback((file: File) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setImageSrc(reader.result as string);
    });
    reader.readAsDataURL(file);
  }, []);

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const getCroppedImg = useCallback(async (): Promise<Blob> => {
    if (!imageSrc || !croppedAreaPixels) {
      throw new Error('Crop parameters or image missing');
    }
    return getCroppedImgBlob(imageSrc, croppedAreaPixels);
  }, [imageSrc, croppedAreaPixels]);

  const reset = useCallback(() => {
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  }, []);

  return {
    imageSrc,
    crop,
    zoom,
    setCrop,
    setZoom,
    setImage,
    onCropComplete,
    getCroppedImg,
    reset,
  };
}

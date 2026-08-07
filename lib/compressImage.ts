// Modern phone cameras produce 3-10MB photos at full resolution -- uploading
// those as-is over a mobile connection is what makes the profile-photos
// step feel like it's hanging. Downscaling to a reasonable max dimension
// and re-encoding as JPEG cuts that down to a few hundred KB with no
// visible quality loss at the sizes this app actually displays photos at.
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.8;

// Every profile-photo display in the app (own profile hero, someone else's
// profile, Discover cards) renders inside an aspect-[3/4] box with
// object-cover -- without cropping to that same ratio at upload time, a
// landscape shot and a very tall portrait both "fit" that box but get
// cropped completely differently (a wide zoom-out vs. a tight vertical
// slice), so photos looked inconsistently sized/framed next to each other
// even though every container was the same box. Cropping to 3:4 here once,
// centered on the original image, means every stored photo already has the
// shape every consumer displays it at.
const TARGET_ASPECT = 3 / 4;

export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file;

  const bitmap = await createImageBitmap(file);

  const sourceAspect = bitmap.width / bitmap.height;
  let cropWidth = bitmap.width;
  let cropHeight = bitmap.height;
  if (sourceAspect > TARGET_ASPECT) {
    // Wider than 3:4 -- crop the sides.
    cropWidth = Math.round(bitmap.height * TARGET_ASPECT);
  } else {
    // Taller than 3:4 -- crop top/bottom.
    cropHeight = Math.round(bitmap.width / TARGET_ASPECT);
  }
  const cropX = Math.round((bitmap.width - cropWidth) / 2);
  const cropY = Math.round((bitmap.height - cropHeight) / 2);

  const scale = Math.min(1, MAX_DIMENSION / Math.max(cropWidth, cropHeight));
  const width = Math.round(cropWidth * scale);
  const height = Math.round(cropHeight * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;
  ctx.drawImage(bitmap, cropX, cropY, cropWidth, cropHeight, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY)
  );
  if (!blob) return file;

  return new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' });
}

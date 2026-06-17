import { supabase } from "./supabase";

export async function uploadPhoto(
  file: File,
  bucket: "photos" | "proofs",
  userId: string
): Promise<string | null> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${userId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    console.error("Upload error:", error.message);
    return null;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadPhotos(
  files: File[],
  bucket: "photos" | "proofs",
  userId: string
): Promise<(string | null)[]> {
  return Promise.all(files.map((f) => uploadPhoto(f, bucket, userId)));
}

'use client';

import { FaceDetector, FilesetResolver } from '@mediapipe/tasks-vision';

let detectorPromise: Promise<FaceDetector> | null = null;

// Lazy singleton -- the WASM runtime + model (~200KB) only download the
// first time someone actually reaches the photo step, not on every app
// load, and every subsequent detection reuses the same detector instance.
function getDetector(): Promise<FaceDetector> {
  if (!detectorPromise) {
    detectorPromise = FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    ).then((fileset) =>
      FaceDetector.createFromOptions(fileset, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',
        },
        runningMode: 'IMAGE',
      })
    );
  }
  return detectorPromise;
}

// Throws on infra failure (model/WASM didn't load, decode failed) so the
// caller can tell "no face in this photo" apart from "couldn't check this
// photo" -- those need opposite responses: block the first, ignore the
// second. A flaky CDN must never be the reason someone can't finish
// onboarding.
async function photoHasFace(file: File): Promise<boolean> {
  const detector = await getDetector();
  const bitmap = await createImageBitmap(file);
  try {
    return detector.detect(bitmap).detections.length > 0;
  } finally {
    bitmap.close();
  }
}

export type FaceCheckResult = 'has-face' | 'no-face-found' | 'unverifiable';

// At least one photo in the set needs a detected face. 'unverifiable'
// (model failed to load, browser lacks WASM/createImageBitmap, etc.)
// deliberately fails open -- callers should let onboarding continue
// rather than block someone over a broken CDN.
export async function checkPhotosForFace(files: File[]): Promise<FaceCheckResult> {
  const outcomes = await Promise.allSettled(files.map(photoHasFace));
  if (outcomes.some((o) => o.status === 'fulfilled' && o.value)) return 'has-face';
  if (outcomes.every((o) => o.status === 'fulfilled')) return 'no-face-found';
  return 'unverifiable';
}

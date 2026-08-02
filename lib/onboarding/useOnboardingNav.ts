'use client';

import { useRouter } from 'next/navigation';
import { create } from 'zustand';

interface OnboardingTransitionState {
  active: boolean;
  activate: () => void;
  deactivate: () => void;
}

// Single flag, read by OnboardingTransitionOverlay (mounted once in
// app/(auth)/layout.tsx) -- same pattern as useScreenshotContextStore in
// lib/store.ts. Keeping this out of that file since it's onboarding-only
// state, not app-wide.
export const useOnboardingTransitionStore = create<OnboardingTransitionState>((set) => ({
  active: false,
  activate: () => set({ active: true }),
  deactivate: () => set({ active: false }),
}));

const FADE_OUT_MS = 200;
const SETTLE_MS = 120;
const PRELOAD_TIMEOUT_MS = 500;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Preloads the next screen's background image with a hard timeout cap --
// this is deliberately bounded, unlike the fade-in-on-onLoad approach
// OnboardingBackground itself used to use (and got permanently stuck on
// when the load event didn't fire). A slow or failed load here just
// means the transition proceeds without having fully warmed the image;
// it never blocks navigation indefinitely.
function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      resolve();
    };
    const img = new window.Image();
    img.onload = finish;
    img.onerror = finish;
    img.src = src;
    setTimeout(finish, PRELOAD_TIMEOUT_MS);
  });
}

// Wraps router.push/replace for onboarding's forward-progress clicks: fades
// the current screen to the overlay, gives the destination's background
// image a bounded head start, navigates, then fades the overlay back out
// once the new screen (which fades itself in via its own animate-fade-in)
// has had a moment to paint. Pass the destination's OnboardingBackground
// image (when it has one) so the crossfade doesn't reveal a half-loaded
// photo.
export function useOnboardingNav() {
  const router = useRouter();

  const navigate = async (path: string, image: string | undefined, replace: boolean) => {
    useOnboardingTransitionStore.getState().activate();
    await Promise.all([image ? preloadImage(image) : Promise.resolve(), wait(FADE_OUT_MS)]);
    if (replace) router.replace(path);
    else router.push(path);
    await wait(SETTLE_MS);
    useOnboardingTransitionStore.getState().deactivate();
  };

  return {
    goTo: (path: string, image?: string) => navigate(path, image, false),
    replaceTo: (path: string, image?: string) => navigate(path, image, true),
  };
}

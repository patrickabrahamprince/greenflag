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
// image a bounded head start, then navigates. The overlay itself (not
// this hook) is responsible for fading back out -- it watches the actual
// route via usePathname() and clears once Next has really finished
// swapping in the new screen. A fixed delay here instead (there used to
// be one) races the real navigation: on a route that hasn't been
// prefetched, fetching + rendering the new segment can easily take
// longer than a guessed timeout, so the overlay would fade out early and
// flash the OLD screen back into view before the real destination
// arrived a moment later -- looked exactly like "goes black, shows the
// same screen again, then finally moves on."
export function useOnboardingNav() {
  const router = useRouter();

  const navigate = async (path: string, image: string | undefined, replace: boolean) => {
    useOnboardingTransitionStore.getState().activate();
    await Promise.all([image ? preloadImage(image) : Promise.resolve(), wait(FADE_OUT_MS)]);
    if (replace) router.replace(path);
    else router.push(path);
  };

  return {
    goTo: (path: string, image?: string) => navigate(path, image, false),
    replaceTo: (path: string, image?: string) => navigate(path, image, true),
  };
}

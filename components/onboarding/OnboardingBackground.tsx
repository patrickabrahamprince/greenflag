interface OnboardingBackgroundProps {
  image: string;
  // Login is the one screen that keeps the original, lighter scrim --
  // it's the very first thing anyone sees, so the photo needs to still
  // read as a photo rather than a near-silhouette. Every other onboarding
  // screen uses the darker default now for stronger text contrast.
  light?: boolean;
}

// Full-bleed photo + a brand-matched dark scrim, sitting behind a
// screen's existing content via a negative z-index -- drop this in as
// the first child of a `relative` root and nothing else on the page
// needs to change. The scrim gets more opaque toward the bottom since
// that's where the CTA and body copy usually live.
//
// The image is always visible immediately (no opacity/onLoad gating) --
// a prior version faded it in from opacity-0 once its onLoad event
// fired, which left it permanently invisible whenever that event didn't
// fire (a real failure mode in the native WebView, not just a rare
// edge case). animate-fade-in is a plain CSS keyframe that plays on
// mount regardless of whether the image data has actually arrived yet,
// so there's no state for a missed event to get stuck in.
export function OnboardingBackground({ image, light }: OnboardingBackgroundProps) {
  // Fades to base black (#000000) -- the design system's photo screens
  // use a plain dark scrim with no colored glow.
  const scrim = light
    ? 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.65) 55%, rgba(0,0,0,0.92) 100%)'
    : 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.8) 55%, rgba(0,0,0,0.97) 100%)';

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-base">
      <img key={image} src={image} alt="" className="w-full h-full object-cover animate-fade-in" />
      <div className="absolute inset-0" style={{ background: scrim }} />
    </div>
  );
}

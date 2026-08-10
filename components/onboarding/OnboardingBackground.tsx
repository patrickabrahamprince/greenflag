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
// Stronger than the shared --wine-glow-bottom (globals.css) on purpose --
// here it's fighting a real photo plus a heavy black scrim on top of it,
// where the shared version only ever sits over flat black. The same
// alpha that reads clearly on a pure-black screen all but disappears
// under a busy photo, so onboarding gets its own, more saturated pass.
const ONBOARDING_WINE_GLOW =
  'radial-gradient(ellipse 150% 65% at 50% 100%, rgba(69, 5, 12, 0.85) 0%, rgba(69, 5, 12, 0.5) 40%, transparent 78%)';

export function OnboardingBackground({ image, light }: OnboardingBackgroundProps) {
  // The wine glow lives on this scrim div rather than the wrapper's own
  // bg-base -- the full-bleed <img> below sits on top of the wrapper and
  // would otherwise hide the glow completely. Listed first so it paints
  // above the black gradient and actually reads as a warm tint bleeding
  // through the darkened photo.
  const darkGradient = light
    ? 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.65) 55%, rgba(0,0,0,0.92) 100%)'
    : 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.8) 55%, rgba(0,0,0,0.97) 100%)';
  const scrim = `${ONBOARDING_WINE_GLOW}, ${darkGradient}`;

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-base">
      <img key={image} src={image} alt="" className="w-full h-full object-cover animate-fade-in" />
      <div className="absolute inset-0" style={{ background: scrim }} />
    </div>
  );
}

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

export function OnboardingBackground({ image }: OnboardingBackgroundProps) {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#FAF9F6]">
      {image && (
        <img
          key={image}
          src={image}
          alt=""
          className="w-full h-full object-cover object-top opacity-30 animate-fade-in filter saturate-125"
        />
      )}
      {/* Porcelain ambient gradient wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(250, 249, 246, 0.4) 0%, rgba(250, 249, 246, 0.85) 45%, #FAF9F6 100%)',
        }}
      />
      {/* Warm ambient emerald & amber glow spots */}
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-20 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}

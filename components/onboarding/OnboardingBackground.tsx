interface OnboardingBackgroundProps {
  image: string;
}

// Full-bleed photo + a brand-matched dark scrim, sitting behind a
// screen's existing content via a negative z-index -- drop this in as
// the first child of a `relative` root and nothing else on the page
// needs to change. The scrim gets more opaque toward the bottom since
// that's where the CTA and body copy usually live; the fuchsia glow up
// top keeps it feeling like this app rather than a generic photo dump.
export function OnboardingBackground({ image }: OnboardingBackgroundProps) {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <img src={image} alt="" className="w-full h-full object-cover" />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 120% 50% at 50% 0%, rgba(192,38,211,0.22) 0%, transparent 55%), linear-gradient(180deg, rgba(11,6,20,0.5) 0%, rgba(11,6,20,0.82) 55%, #0B0614 100%)',
        }}
      />
    </div>
  );
}

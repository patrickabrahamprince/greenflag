interface OnboardingBackgroundProps {
  image?: string;
  light?: boolean;
}

export function OnboardingBackground({}: OnboardingBackgroundProps) {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-white pointer-events-none">
      {/* Clean white canvas with subtle neutral soft vignette */}
      <div className="absolute inset-0 bg-white" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-stone-100/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 bg-stone-50/80 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/4 w-96 h-96 bg-stone-100/50 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}

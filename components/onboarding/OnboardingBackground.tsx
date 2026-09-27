interface OnboardingBackgroundProps {
  image?: string;
  light?: boolean;
}

export function OnboardingBackground({}: OnboardingBackgroundProps) {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#FAF9F6] pointer-events-none">
      {/* Crisp porcelain warm background with subtle ambient glows */}
      <div className="absolute inset-0 bg-[#FAF9F6]" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/4 w-96 h-96 bg-emerald-700/5 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}

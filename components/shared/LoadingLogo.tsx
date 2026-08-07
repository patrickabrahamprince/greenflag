interface LoadingLogoProps {
  size?: number;
  className?: string;
}

// Shared branded loading indicator -- replaces the generic Loader2 spinner
// on the app's main screens with the same pulsing logo used in the
// onboarding transition overlay, so a loading moment reads as "GreenFlag
// is thinking" rather than a generic browser spinner.
export function LoadingLogo({ size = 64, className = '' }: LoadingLogoProps) {
  return (
    <img
      src="/logo.png"
      alt=""
      className={`animate-logo-pulse ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

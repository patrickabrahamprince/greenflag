import { OnboardingTransitionOverlay } from '@/components/onboarding/OnboardingTransitionOverlay';
import { OnboardingHydrationGate } from '@/components/onboarding/OnboardingHydrationGate';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Every screen in this route group already renders its own full-bleed
  // background (solid black, or login/signup's violet gradient) and
  // constrains its own content width internally (max-w-sm/max-w-md).
  // Wrapping that in a second layer of max-w-app + px-4 here squeezed
  // every one of those backgrounds away from the true screen edges,
  // leaving a black gutter down both sides -- most visible on login,
  // where the gutter's flat black cut directly into the violet gradient
  // that's supposed to bleed edge-to-edge.
  return (
    <>
      <OnboardingHydrationGate>{children}</OnboardingHydrationGate>
      <OnboardingTransitionOverlay />
    </>
  );
}

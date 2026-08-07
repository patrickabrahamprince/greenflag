import { LoadingLogo } from '@/components/shared/LoadingLogo';

export function DiscoverySkeleton() {
  return (
    <div className="min-h-dvh screen-gradient flex items-center justify-center">
      <LoadingLogo />
    </div>
  );
}

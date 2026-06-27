import { BottomNav } from '@/components/layout/bottom-nav';

export default function DiscoverLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="pb-20">{children}</div>
      <BottomNav />
    </>
  );
}

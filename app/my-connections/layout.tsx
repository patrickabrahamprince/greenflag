import { BottomNav } from '@/components/layout/bottom-nav';

export default function MyConnectionsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="pb-20">{children}</div>
      <BottomNav />
    </>
  );
}

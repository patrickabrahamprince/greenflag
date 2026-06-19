import { BottomNav } from '@/components/layout/bottom-nav';

export default function HostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="min-h-screen bg-black max-w-app mx-auto px-4 pb-24">
        {children}
      </div>
      <BottomNav />
    </>
  );
}

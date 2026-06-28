import { BottomNav } from '@/components/layout/bottom-nav';

export default function HostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="min-h-screen bg-[#FAF9F7] max-w-app mx-auto px-4 pb-24">
        {children}
      </div>
      <BottomNav />
    </>
  );
}

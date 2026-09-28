import { BottomNav } from '@/components/layout/bottom-nav';

export default function GuestLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col justify-between">
      <main className="flex-1 w-full pt-[env(safe-area-inset-top,0px)] pb-[calc(4rem+env(safe-area-inset-bottom,0px))]">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

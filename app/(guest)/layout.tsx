import { BottomNav } from '@/components/layout/bottom-nav';

export default function GuestLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 flex flex-col bg-white overflow-hidden">
      <div className="flex-1 w-full h-full overflow-hidden flex flex-col">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}

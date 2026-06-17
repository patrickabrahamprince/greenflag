import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-dvh bg-bg flex flex-col items-center justify-center px-6 text-center space-y-6">
      <div className="w-20 h-20 rounded-[24px] bg-accent/10 border-[0.5px] border-accent/20 flex items-center justify-center">
        <span className="text-5xl font-display font-bold text-accent tracking-[-0.02em]">G</span>
      </div>
      <div className="space-y-2">
        <h1 className="text-[28px] font-display font-bold tracking-[-0.02em]">Not found</h1>
        <p className="text-sm text-text-muted">This page doesn't exist.</p>
      </div>
      <Link href="/discover"
        className="w-full max-w-xs h-14 rounded-[16px] bg-accent text-bg font-semibold text-[15px] flex items-center justify-center">
        Back to Discover
      </Link>
    </div>
  );
}

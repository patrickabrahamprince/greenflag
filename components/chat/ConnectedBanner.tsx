export function ConnectedBanner() {
  return (
    <div
      className="mx-4 mb-2 rounded-xl px-4 py-3 flex items-center gap-2 animate-slide-down"
      style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)' }}
    >
      <span className="text-sm text-gold font-medium font-display italic">
        You&apos;re Connected. Contact exchange unlocked.
      </span>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FAF9F7] max-w-app mx-auto px-4 py-4 animate-pulse">
      <div className="flex items-center gap-3 py-4">
        <div className="w-10 h-10 rounded-xl skeleton" />
        <div className="h-6 w-32 skeleton rounded" />
      </div>

      <div className="flex flex-col items-center py-8">
        <div className="w-24 h-24 rounded-full skeleton mb-4" />
        <div className="h-8 w-40 skeleton rounded mb-2" />
        <div className="h-4 w-24 skeleton rounded" />
      </div>

      <div className="space-y-3 px-4">
        <div className="h-12 rounded-xl skeleton" />
        <div className="h-12 rounded-xl skeleton" />
      </div>

      <div className="px-4 mt-6">
        <div className="h-24 rounded-2xl skeleton" />
      </div>
    </div>
  );
}

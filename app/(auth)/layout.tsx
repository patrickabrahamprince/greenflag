export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FAF9F7] flex items-center justify-center max-w-app mx-auto px-4">
      {children}
    </div>
  );
}

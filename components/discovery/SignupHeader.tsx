export function SignupHeader() {
  return (
    <div className="text-center mb-12">
      <div className="relative inline-block">
        <div className="absolute inset-0 blur-3xl opacity-20" style={{ background: 'radial-gradient(circle, #C9A961 0%, transparent 70%)' }} />
        <h1 className="relative text-5xl font-display italic text-white mb-3" style={{ fontWeight: 500 }}>
          Set your standards.
        </h1>
      </div>
      <div className="hairline mx-auto mt-6 mb-2 w-16" />
      <p className="text-muted text-sm font-thin tracking-wide mt-4">Create your account</p>
    </div>
  );
}

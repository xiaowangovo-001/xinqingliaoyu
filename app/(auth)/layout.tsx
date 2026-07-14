export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--background)]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2 text-2xl font-semibold text-[var(--foreground)]">
            <span className="text-3xl">☀️</span>
            知心
          </a>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, var(--cream), #fffaf2 42%, #f7dec4)" }}>
      <div className="w-full max-w-sm">
        {/* 로고 */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🐾</div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--ink)" }}>
            PetMatch
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            같은 공원, 같은 시간, 진짜 인연
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}

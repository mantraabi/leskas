export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F5F4F0] flex flex-col items-center justify-center p-4">

      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand/5 rounded-full" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-brand/5 rounded-full" />
      </div>

      <div className="w-full max-w-sm relative z-10">

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-11 h-11 bg-brand rounded-2xl flex items-center justify-center shadow-sm">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
              <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#1C1B19] tracking-tight leading-none">
              LesKas
            </p>
            <p className="text-[11px] text-[#9CA3AF] font-medium tracking-widest uppercase mt-1">
              Keuangan Les Privat
            </p>
          </div>
        </div>

        {children}

        {/* Footer */}
        <p className="text-center text-xs text-[#9CA3AF] mt-6">
          © 2026 LesKas. Dibuat dengan ❤️ untuk guru Indonesia.
        </p>

      </div>
    </div>
  );
}
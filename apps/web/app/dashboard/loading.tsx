/**
 * Skeleton instant saat navigasi ke /dashboard/*.
 * Next.js otomatis render ini selama page server component masih fetch.
 */
export default function DashboardLoading() {
  return (
    <div className="max-w-2xl mx-auto animate-pulse">
      {/* Header */}
      <div className="mb-5">
        <div className="h-6 w-40 bg-[#E4E2DC] rounded mb-2" />
        <div className="h-3 w-56 bg-[#E4E2DC] rounded" />
      </div>

      {/* Card 1 */}
      <div className="bg-white rounded-xl border border-[#E4E2DC] p-5 mb-4">
        <div className="h-4 w-32 bg-[#E4E2DC] rounded mb-3" />
        <div className="h-3 w-full bg-[#F0EEE9] rounded mb-2" />
        <div className="h-3 w-3/4 bg-[#F0EEE9] rounded mb-2" />
        <div className="h-3 w-1/2 bg-[#F0EEE9] rounded" />
      </div>

      {/* Card 2 */}
      <div className="bg-white rounded-xl border border-[#E4E2DC] p-5 mb-4">
        <div className="h-4 w-28 bg-[#E4E2DC] rounded mb-3" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#F0EEE9]" />
              <div className="flex-1">
                <div className="h-3 w-32 bg-[#F0EEE9] rounded mb-1.5" />
                <div className="h-2.5 w-24 bg-[#F0EEE9] rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

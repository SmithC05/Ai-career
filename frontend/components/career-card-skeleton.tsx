export function CareerCardSkeleton() {
  return (
    <div className="h-[260px] rounded-3xl border border-white/10 bg-white/[0.02] p-6 animate-pulse">
      <div className="h-5 w-2/3 rounded bg-white/10" />
      <div className="mt-3 h-4 w-1/3 rounded bg-white/10" />
      <div className="mt-8 grid grid-cols-3 gap-3">
        <div className="h-10 rounded bg-white/10" />
        <div className="h-10 rounded bg-white/10" />
        <div className="h-10 rounded bg-white/10" />
      </div>
      <div className="mt-10 h-10 rounded bg-white/10" />
    </div>
  );
}

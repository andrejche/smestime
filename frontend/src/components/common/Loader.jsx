export function Spinner({ size = 'md' }) {
  const s = { sm: 'w-4 h-4 border-2', md: 'w-6 h-6 border-2', lg: 'w-8 h-8 border-3' }[size];
  return (
    <div className={`${s} border-current border-t-transparent rounded-full animate-spin inline-block`} />
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Вчитување...</p>
      </div>
    </div>
  );
}

function Shimmer({ className }) {
  return (
    <div className={`relative overflow-hidden bg-gray-100 rounded-xl ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  );
}

export function PropertyCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white border border-gray-100">
      <Shimmer className="aspect-[4/3] rounded-none" />
      <div className="p-3 space-y-2">
        <Shimmer className="h-4 w-3/4" />
        <Shimmer className="h-3 w-1/2" />
        <Shimmer className="h-4 w-1/3 mt-2" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <Shimmer key={j} className={`h-5 flex-1 ${j === 0 ? 'flex-[2]' : ''}`} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function Shimmer({ className = "" }) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-bg-elevated ${className}`}
    >
      <div className="animate-shimmer absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}

export function PostCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-bg-surface p-5">
      <div className="mb-3 flex items-center gap-2.5">
        <Shimmer className="h-8 w-8 rounded-full" />
        <Shimmer className="h-4 w-24" />
      </div>
      <Shimmer className="mb-2 h-6 w-3/4" />
      <Shimmer className="h-4 w-1/2" />
      <div className="mt-4 flex gap-3">
        <Shimmer className="h-5 w-12" />
        <Shimmer className="h-5 w-12" />
      </div>
    </div>
  );
}

export function FeedSkeleton({ count = 4 }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
}

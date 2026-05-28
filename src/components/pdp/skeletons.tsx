export function Skeleton({ className = "" }: { className?: string }) {
  return <span className={`block animate-pulse rounded-md bg-(--color-surface-secondary) ${className}`} />;
}

export function GameHeaderSkeleton() {
  return (
    <div className="flex items-center gap-4">
      <Skeleton className="size-16 rounded-xl" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-36" />
      </div>
    </div>
  );
}

export function TabsSkeleton() {
  return (
    <div className="flex gap-4 border-b border-(--color-border-low) py-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-6 w-20" />
      ))}
    </div>
  );
}

export function FilterBarSkeleton() {
  return (
    <div className="flex flex-wrap items-center gap-3 py-4">
      <Skeleton className="h-11 w-[300px] rounded-2xl" />
      <Skeleton className="h-11 w-36 rounded-2xl" />
      <Skeleton className="h-11 w-36 rounded-2xl" />
      <Skeleton className="ml-auto h-11 w-[220px] rounded-2xl" />
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-(--color-border) bg-white">
      <Skeleton className="aspect-[210/118] w-full rounded-none" />
      <div className="flex flex-col gap-2 px-3 py-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="mt-2 h-5 w-24" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function BreadcrumbSkeleton() {
  return (
    <div className="flex items-center gap-2 py-1">
      <Skeleton className="h-4 w-10" />
      <span className="text-(--color-text-secondary)">/</span>
      <Skeleton className="h-4 w-24" />
    </div>
  );
}

export function ResultsCountSkeleton() {
  return <Skeleton className="h-6 w-72" />;
}

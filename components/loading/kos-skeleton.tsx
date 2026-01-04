import { Skeleton } from "@/components/ui/skeleton";

export function KosCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-3 w-1/4" />
          <Skeleton className="h-2 w-full rounded-full" />
        </div>

        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </div>
  );
}

export function KosListingSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <KosCardSkeleton key={i} />
      ))}
    </div>
  );
}


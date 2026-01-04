import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function PageLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" className="text-primary" />
        <p className="text-sm font-medium text-muted-foreground">Memuat halaman...</p>
      </div>
    </div>
  );
}


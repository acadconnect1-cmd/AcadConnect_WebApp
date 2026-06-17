import { cn } from '@/lib/utils'

// 1. Sleek top-border linear loading progress bar
interface LineProgressProps {
  className?: string
}

export function LineProgress({ className }: LineProgressProps) {
  return (
    <div className={cn('fixed top-0 left-0 right-0 z-50 h-1 w-full overflow-hidden bg-primary/20', className)}>
      <div className="h-full w-full bg-primary animate-[shimmer_1.5s_infinite_linear] origin-left" 
        style={{
          backgroundImage: 'linear-gradient(90deg, transparent 0%, var(--primary) 50%, transparent 100%)',
          backgroundSize: '200% 100%'
        }} 
      />
    </div>
  )
}

// 2. Generic Pulsing Skeleton primitive block
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted/70', className)}
      {...props}
    />
  )
}

// 3. Card Skeleton (useful for jobs boards grids)
interface SkeletonCardProps {
  className?: string
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div className={cn('rounded-lg border border-border bg-card p-6 space-y-4 shadow-sm', className)}>
      {/* Header section */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-9 w-9 rounded-full shrink-0" />
      </div>

      {/* Body content lines */}
      <div className="space-y-2 pt-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      {/* Bottom details / badges row */}
      <div className="flex items-center gap-2 pt-4 border-t border-border">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-24 rounded-full" />
        <div className="ml-auto">
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
      </div>
    </div>
  )
}

// 4. Table Skeleton (useful for recruiters dashboard tables)
interface SkeletonTableProps {
  rows?: number
  cols?: number
  className?: string
}

export function SkeletonTable({ rows = 5, cols = 4, className }: SkeletonTableProps) {
  return (
    <div className={cn('w-full border border-border rounded-lg overflow-hidden bg-card shadow-sm', className)}>
      {/* Table Header skeleton */}
      <div className="grid border-b border-border bg-muted/30 px-6 py-4"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {Array.from({ length: cols }).map((_, idx) => (
          <Skeleton key={`head-${idx}`} className="h-4 w-24" />
        ))}
      </div>

      {/* Table Rows skeletons */}
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div
            key={`row-${rIdx}`}
            className="grid px-6 py-4 items-center"
            style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
          >
            {Array.from({ length: cols }).map((_, cIdx) => (
              <div key={`cell-${rIdx}-${cIdx}`} className="pr-4">
                {cIdx === 0 ? (
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ) : (
                  <Skeleton className="h-4 w-5/6" />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// 5. Standard list row item skeleton (useful for alerts, logs, notifications lists)
interface SkeletonListProps {
  count?: number
  className?: string
}

export function SkeletonList({ count = 4, className }: SkeletonListProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: count }).map((_, idx) => (
        <div key={`list-${idx}`} className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 shadow-sm">
          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
          <div className="space-y-2 flex-1 min-w-0">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <Skeleton className="h-4 w-12 shrink-0" />
        </div>
      ))}
    </div>
  )
}

// 6. Full Page Overlay Loader (ideal for page routing or action-blocking processing)
interface PageLoaderProps {
  message?: string
  className?: string
}

export function PageLoader({ message = 'Loading workspace...', className }: PageLoaderProps) {
  return (
    <div className={cn('fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md', className)}>
      <div className="relative flex items-center justify-center">
        {/* Glow backdrop ring */}
        <div className="absolute -inset-2 rounded-full bg-primary/10 blur-xl w-16 h-16 animate-pulse" />
        
        {/* Double-ring spinner */}
        <div className="relative h-12 w-12 rounded-full border-4 border-muted" />
        <div className="absolute h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
      
      {message && (
        <p className="mt-4 text-sm font-medium text-muted-foreground animate-pulse tracking-wide">
          {message}
        </p>
      )}
    </div>
  )
}

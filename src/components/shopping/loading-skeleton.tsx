'use client';

import { Skeleton } from '@/components/ui/skeleton';

type LoadingSkeletonProps = {
  viewMode: 'list' | 'grid';
};

export default function LoadingSkeleton({ viewMode }: LoadingSkeletonProps) {
  return (
    <div
      className={
        viewMode === 'list'
          ? 'space-y-3'
          : 'grid grid-cols-2 gap-4'
      }
    >
      {[...Array(viewMode === 'list' ? 3 : 4)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 bg-card p-3 rounded-2xl shadow-sm"
        >
          <Skeleton className="size-6 shrink-0 rounded-lg" />
          <Skeleton className="size-16 rounded-xl" />
          <div className="flex-grow space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

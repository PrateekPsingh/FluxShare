interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'title' | 'rect';
  width?: string;
  height?: string;
}

export function Skeleton({ className = '', variant = 'rect', width, height }: SkeletonProps) {
  const variantClass = variant === 'text' ? 'skeleton-text' : variant === 'title' ? 'skeleton-title' : '';

  return (
    <div
      className={`skeleton ${variantClass} ${className}`.trim()}
      style={{ ...(width ? { width } : {}), ...(height ? { height } : {}) }}
      aria-hidden="true"
    />
  );
}

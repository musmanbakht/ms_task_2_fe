export default function LoadingSkeleton({ text = 'Loading…', className = 'h-32' }) {
  return <div role="status" aria-live="polite" className={`animate-pulse flex items-center justify-center rounded-xl bg-gray-200 text-gray-600 ${className}`}>{text}</div>;
}

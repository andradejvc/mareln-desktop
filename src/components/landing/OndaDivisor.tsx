export default function OndaDivisor({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 80"
      preserveAspectRatio="none"
      fill="currentColor"
      className={className}
    >
      <path d="M0 40C180 10 360 10 540 35S900 70 1080 45 1350 25 1440 40V80H0Z" />
    </svg>
  );
}
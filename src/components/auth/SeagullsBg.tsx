const gaivotas = [
  { top: "6%", left: "4%", size: 70, rotate: -10 },
  { top: "14%", left: "58%", size: 110, rotate: 6 },
  { top: "30%", left: "80%", size: 60, rotate: -4 },
  { top: "46%", left: "-2%", size: 120, rotate: 8 },
  { top: "62%", left: "70%", size: 130, rotate: -8 },
  { top: "80%", left: "20%", size: 80, rotate: 5 },
  { top: "88%", left: "85%", size: 50, rotate: -6 },
];

export default function SeagullsBg() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {gaivotas.map((g, i) => (
        <svg
          key={i}
          viewBox="0 0 60 24"
          width={g.size}
          style={{ top: g.top, left: g.left, transform: `rotate(${g.rotate}deg)` }}
          className="absolute fill-none stroke-gray-300/60"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 14 C12 2, 22 4, 30 14 C38 4, 48 2, 58 14" />
        </svg>
      ))}
    </div>
  );
}
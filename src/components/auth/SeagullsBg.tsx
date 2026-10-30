const gaivotas = [
  { top: "6%", left: "4%", size: 40, rotate: -10 },
  { top: "14%", left: "58%", size: 64, rotate: 6 },
  { top: "30%", left: "80%", size: 36, rotate: -4 },
  { top: "46%", left: "-1%", size: 70, rotate: 8 },
  { top: "62%", left: "70%", size: 76, rotate: -8 },
  { top: "80%", left: "20%", size: 48, rotate: 5 },
  { top: "88%", left: "85%", size: 30, rotate: -6 },
];

export default function SeagullsBg() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {gaivotas.map((g, i) => (
        <i
          key={i}
          className="fi-rr-bird absolute text-gray-300/70"
          style={{
            top: g.top,
            left: g.left,
            fontSize: g.size,
            transform: `rotate(${g.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}
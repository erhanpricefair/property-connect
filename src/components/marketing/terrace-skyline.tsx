// A stylised row of Victorian terrace houses — parapets, chimney pots, and a
// run of cast-iron lacework along the verandah rail. That ironwork ("Melbourne
// lace") is one of the most recognisable details of the city's own terrace
// housing, which is why it's the one piece of texture in an otherwise plain
// line drawing.
function lacePath(startX: number, y: number, count: number, scallopWidth: number) {
  let d = `M ${startX} ${y}`;
  for (let i = 0; i < count; i++) {
    const x = startX + i * scallopWidth;
    const midX = x + scallopWidth / 2;
    const endX = x + scallopWidth;
    d += ` Q ${midX} ${y + 10}, ${endX} ${y}`;
  }
  return d;
}

const HOUSES = [
  { x: 0, width: 96, roofHeight: 34, chimneyX: 20 },
  { x: 96, width: 84, roofHeight: 46, chimneyX: 60 },
  { x: 180, width: 100, roofHeight: 30, chimneyX: 30 },
  { x: 280, width: 88, roofHeight: 42, chimneyX: 24 },
  { x: 368, width: 96, roofHeight: 34, chimneyX: 62 },
  { x: 464, width: 90, roofHeight: 48, chimneyX: 22 },
];

const FACADE_TOP = 60;
const FACADE_BOTTOM = 220;
const RAIL_Y = 150;

export function TerraceSkyline({ className }: { className?: string }) {
  const width = 554;

  return (
    <svg
      viewBox={`0 0 ${width} 240`}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {HOUSES.map((house, i) => (
        <g key={i}>
          <path
            d={`M ${house.x} ${FACADE_TOP} L ${house.x + house.width} ${FACADE_TOP} L ${house.x + house.width} ${FACADE_BOTTOM} L ${house.x} ${FACADE_BOTTOM} Z`}
          />
          <path
            d={`M ${house.x} ${FACADE_TOP} Q ${house.x + house.width / 2} ${FACADE_TOP - house.roofHeight}, ${house.x + house.width} ${FACADE_TOP}`}
          />
          <rect x={house.x + house.chimneyX} y={FACADE_TOP - house.roofHeight * 0.55 - 16} width={10} height={18} />
          <line x1={house.x} y1={RAIL_Y} x2={house.x + house.width} y2={RAIL_Y} />
        </g>
      ))}
      {HOUSES.map((house, i) => (
        <path key={`lace-${i}`} d={lacePath(house.x + 6, RAIL_Y, Math.floor((house.width - 12) / 14), 14)} strokeWidth={1} />
      ))}
      <line x1={0} y1={FACADE_BOTTOM} x2={width} y2={FACADE_BOTTOM} strokeWidth={1.5} />
    </svg>
  );
}

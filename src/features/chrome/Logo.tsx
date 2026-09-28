/** A single island tile – the brand mark. Pixel art, 8×8. */
const ROWS = ['eeeeeeee', 'eessggee', 'esggbgse', 'esgbtgse', 'esggtgse', 'eessssee', 'ewweewwe', 'eeeeeeee'];
const COLORS: Record<string, string> = {
  e: '#2a7f9e',
  w: '#7fd0d4',
  s: '#ecd49d',
  g: '#6aab45',
  b: '#2e6b33',
  t: '#7a4f2e',
};

export function Logo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 8 8" shapeRendering="crispEdges" aria-hidden="true">
      {ROWS.flatMap((row, y) =>
        [...row].map((c, x) => <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={COLORS[c]} />),
      )}
    </svg>
  );
}

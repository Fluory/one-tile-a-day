import { pixelIcon, type IconName } from '@/features/render';
import type { Season } from '@/features/world';

/** One of the island's sprites, crisp at any size. Decorative unless a label is given. */
export function PixelIcon({
  name,
  season = 'summer',
  size = 48,
  label,
  className,
}: {
  name: IconName;
  season?: Season;
  size?: number;
  label?: string;
  className?: string;
}) {
  const icon = pixelIcon(name, season);
  const scale = size / Math.max(icon.width, icon.height);
  return (
    <svg
      className={className}
      width={icon.width * scale}
      height={icon.height * scale}
      viewBox={`0 0 ${icon.width} ${icon.height}`}
      shapeRendering="crispEdges"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {icon.pixels.map(([x, y, color]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={color} />
      ))}
    </svg>
  );
}

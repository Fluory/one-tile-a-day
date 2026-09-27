'use client';

/**
 * The day the island currently *shows*. The store holds the target day; this clock eases
 * towards it every frame so tiles pop in one after another instead of all at once.
 * Plain mutable object on purpose – it changes 60 times a second and must not re-render React.
 */
export const clock = {
  day: 0,
  target: 0,
};

export const easeOutBack = (t: number): number => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

export const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

/** Progress (0…1) of something that appears on `from` when the island shows `day`. */
export function appear(day: number, from: number): number {
  return Math.min(1, Math.max(0, day - from + 1));
}

/** Site-wide constants. The repository is the product – every page links back to it. */
export const SITE = {
  name: 'One Tile a Day',
  short: 'one-tile-a-day',
  owner: 'Fluory',
  repo: 'Fluory/one-tile-a-day',
  description:
    'A pixel island in a public GitHub repository that grows by exactly one tile every day – placed by a Claude routine, one commit at a time.',
  routineTime: '08:47',
  timeZone: 'Europe/Berlin',
  siblings: [
    {
      name: 'Grow',
      repo: 'Fluory/Grow',
      tagline: 'A garden that grows with the real weather in Heilbronn.',
      image: 'https://raw.githubusercontent.com/Fluory/Grow/main/world/garden.svg',
      site: process.env.NEXT_PUBLIC_GROW_URL,
    },
    {
      name: 'Wished into Being',
      repo: 'Fluory/wished-into-being',
      tagline: 'An island where everything was wished for by someone.',
      image: 'https://raw.githubusercontent.com/Fluory/wished-into-being/main/world/isle.svg',
      site: process.env.NEXT_PUBLIC_WISHED_URL,
    },
  ],
} as const;

export function repoUrl(path = ''): string {
  return `https://github.com/${SITE.repo}${path ? `/${path}` : ''}`;
}

/** Absolute site URL: explicit env var, else the Vercel production domain, else localhost. */
export function siteUrl(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (explicit) return new URL(explicit);
  if (vercel) return new URL(`https://${vercel}`);
  return new URL('http://localhost:3000');
}

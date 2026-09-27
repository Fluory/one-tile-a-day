import type { MetadataRoute } from 'next';
import { CHAPTERS } from '@/features/chapters';
import { getLatest, getWorld, siteUrl } from '@/features/world-data';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl().toString().replace(/\/$/, '');
  const latest = getLatest().date;
  const pages = ['', '/map', '/logbook', '/chapters'].map((p) => ({ url: `${base}${p}`, lastModified: latest }));
  const chapters = CHAPTERS.map((c) => ({ url: `${base}/chapters/${c.slug}` }));
  const days = getWorld().days.map((d) => ({ url: `${base}/day/${d.day}`, lastModified: d.date }));
  return [...pages, ...chapters, ...days];
}

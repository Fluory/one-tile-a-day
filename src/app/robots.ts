import type { MetadataRoute } from 'next';
import { siteUrl } from '@/features/world-data';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: new URL('/sitemap.xml', siteUrl()).toString(),
  };
}

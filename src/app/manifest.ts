import type { MetadataRoute } from 'next';
import { SITE } from '@/features/world-data';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: 'One Tile',
    description: SITE.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#f7e6cf',
    theme_color: '#2a7f9e',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}

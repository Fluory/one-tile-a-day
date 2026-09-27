import type { Metadata } from 'next';
import { MapExplorer } from '@/features/map';
import { getWorld } from '@/features/world-data';
import pageStyles from '../page.module.css';

export const metadata: Metadata = {
  title: 'Map & timeline',
  description:
    'Zoom into the pixel island, scrub through every day since the sandbank and read the story of each tile.',
  alternates: { canonical: '/map' },
};

export default function MapPage() {
  return (
    <div className={`container ${pageStyles.page}`}>
      <header className={pageStyles.head}>
        <p className="eyebrow">Map &amp; timeline</p>
        <h1 className="h2">Every tile has a day.</h1>
        <p className="lede">
          Drag the timeline back to the sandbank or press play. Click any tile to read what happened there.
        </p>
      </header>
      <MapExplorer world={getWorld()} />
    </div>
  );
}

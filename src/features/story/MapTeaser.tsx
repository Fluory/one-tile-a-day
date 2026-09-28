import Link from 'next/link';
import { ViewTransition } from 'react';
import { Reveal } from '@/shared/motion';
import styles from './MapTeaser.module.css';
import { SceneSection } from './SceneSection';
import { SectionHead } from './SectionHead';

export function MapTeaser({ svg }: { svg: string }) {
  return (
    <SceneSection className="section" camera="top" dim={0.2} labelledBy="map-title">
      <div className={`container ${styles.mapTeaser}`}>
        <SectionHead eyebrow="Map & timeline" title="The whole island, tile by tile." id="map-title">
          Zoom in, drag the timeline back to the sandbank, hover any tile to read its story. The same pixels live in the
          README of the repository and change with every commit.
        </SectionHead>
        <Reveal>
          <Link href="/map" className={`${styles.mapFrame} glass`} aria-label="Open the interactive map">
            <ViewTransition name="island-map" share="morph" default="none">
              <div dangerouslySetInnerHTML={{ __html: svg }} />
            </ViewTransition>
          </Link>
        </Reveal>
      </div>
    </SceneSection>
  );
}

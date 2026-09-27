import { ChapterCards } from '@/features/chapters';
import { renderIsleSvg } from '@/features/render';
import {
  Archipelago,
  Hero,
  LogbookPreview,
  MapTeaser,
  Routine,
  Rules,
  SceneSection,
  SectionHead,
  Timelapse,
} from '@/features/story';
import { getDaysNewestFirst, getLatest, getStats, getWorld, repoUrl } from '@/features/world-data';

export default function HomePage() {
  const world = getWorld();
  const latest = getLatest();
  const stats = getStats();
  const real = world.days.map(({ day, date, title, lore }) => ({ day, date, title, lore }));
  const mapSvg = renderIsleSvg(world, { caption: false });

  return (
    <>
      <Hero latest={latest} stats={stats} />
      <Timelapse real={real} />
      <Rules rulesUrl={repoUrl('blob/main/RULES.md')} />
      <Routine latest={latest} routineUrl={repoUrl('blob/main/ROUTINE.md')} />
      <MapTeaser svg={mapSvg} />
      <LogbookPreview entries={getDaysNewestFirst().slice(0, 6)} />
      <SceneSection className="section" camera="hero" dim={0.3} labelledBy="chapters-title">
        <div className="container">
          <SectionHead eyebrow="Chapters" title="How it works, in four short stories." id="chapters-title" />
          <ChapterCards />
        </div>
      </SceneSection>
      <Archipelago />
    </>
  );
}

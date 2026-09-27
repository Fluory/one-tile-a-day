import type { Metadata } from 'next';
import { ChapterCards } from '@/features/chapters';
import { SceneDirective } from '@/features/scene';
import pageStyles from '../page.module.css';

export const metadata: Metadata = {
  title: 'Chapters',
  description: 'How the island works, told in four short case studies.',
  alternates: { canonical: '/chapters' },
};

export default function ChaptersPage() {
  return (
    <div className={`container ${pageStyles.page}`}>
      <SceneDirective camera="hero" dim={0.35} />
      <header className={pageStyles.head}>
        <p className="eyebrow">Chapters</p>
        <h1 className="h2">How it works, in four short stories.</h1>
        <p className="lede">The idea, the rules, the routine and the pixels – each one a small case study.</p>
      </header>
      <ChapterCards />
    </div>
  );
}

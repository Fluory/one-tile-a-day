import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { CSSProperties } from 'react';
import { ViewTransition } from 'react';
import { chapterBySlug, CHAPTERS } from '@/features/chapters';
import { SceneDirective } from '@/features/scene';
import { PixelIcon } from '@/shared/ui';
import pageStyles from '../../page.module.css';

export const dynamicParams = false;

export function generateStaticParams() {
  return CHAPTERS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const chapter = chapterBySlug(slug);
  if (!chapter) return {};
  return { title: chapter.title, description: chapter.summary, alternates: { canonical: `/chapters/${slug}` } };
}

export default async function ChapterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const chapter = chapterBySlug(slug);
  if (!chapter) notFound();
  const { default: Content } = await import(`@/content/chapters/${slug}.mdx`);
  const index = CHAPTERS.findIndex((c) => c.slug === slug);
  const prev = CHAPTERS[index - 1];
  const next = CHAPTERS[index + 1];

  return (
    <article className={`${pageStyles.narrow} ${pageStyles.page}`}>
      <SceneDirective camera="far" dim={0.7} />
      <header className={pageStyles.chapterHead}>
        <ViewTransition name={`chapter-cover-${chapter.slug}`} share="morph" default="none">
          <div className={pageStyles.chapterCover} style={{ '--cover': chapter.cover } as CSSProperties}>
            <PixelIcon name={chapter.icon} size={180} />
          </div>
        </ViewTransition>
        <p className="eyebrow">
          Chapter {chapter.no} · {chapter.minutes} min read
        </p>
        <ViewTransition name={`chapter-title-${chapter.slug}`} share="morph" default="none">
          <h1 className="h2">{chapter.title}</h1>
        </ViewTransition>
        <p className="lede">{chapter.summary}</p>
      </header>
      <div className={`${pageStyles.panel} glass ${pageStyles.prose}`}>
        <Content />
      </div>
      <nav className={pageStyles.chapterNav} aria-label="More chapters">
        {prev ? (
          <Link className="btn btn-ghost" href={`/chapters/${prev.slug}`} transitionTypes={['nav-back']}>
            ← {prev.title}
          </Link>
        ) : (
          <Link className="btn btn-ghost" href="/chapters">
            ← All chapters
          </Link>
        )}
        {next && (
          <Link className="btn btn-ghost" href={`/chapters/${next.slug}`} transitionTypes={['nav-forward']}>
            {next.title} →
          </Link>
        )}
      </nav>
    </article>
  );
}

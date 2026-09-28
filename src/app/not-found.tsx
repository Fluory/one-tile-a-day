import Link from 'next/link';
import { SceneDirective } from '@/features/scene';
import pageStyles from './page.module.css';

export default function NotFound() {
  return (
    <div
      className={`${pageStyles.narrow} ${pageStyles.page}`}
      style={{ minHeight: '80svh', display: 'grid', alignContent: 'center' }}
    >
      <SceneDirective camera="far" dim={0.2} />
      <div className={`${pageStyles.panel} glass`} style={{ display: 'grid', gap: 'var(--s-4)' }}>
        <p className="eyebrow">404 · open sea</p>
        <h1 className="h2">This tile has not risen yet.</h1>
        <p className="lede">Maybe tomorrow. Until then, the island is this way.</p>
        <p>
          <Link href="/" className="btn btn-accent">
            Back to the island <span className="arrow">→</span>
          </Link>
        </p>
      </div>
    </div>
  );
}

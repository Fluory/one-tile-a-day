import type { Metadata } from 'next';
import { imprint, imprintComplete } from '@/features/legal';
import { SceneDirective } from '@/features/scene';
import pageStyles from '../page.module.css';

export const metadata: Metadata = {
  title: 'Impressum',
  robots: { index: false },
  alternates: { canonical: '/impressum' },
};

export default function ImpressumPage() {
  const i = imprint();
  const complete = imprintComplete(i);
  return (
    <div className={`${pageStyles.narrow} ${pageStyles.page}`} lang="de">
      <SceneDirective camera="far" dim={0.8} />
      <header className={pageStyles.head}>
        <p className="eyebrow">Rechtliches</p>
        <h1 className="h2">Impressum</h1>
      </header>
      <div className={`${pageStyles.panel} glass ${pageStyles.prose}`}>
        <h2>Angaben gemäß § 5 DDG</h2>
        {complete ? (
          <p>
            {i.name}
            <br />
            {i.street}
            <br />
            {i.city}
            <br />
            Deutschland
          </p>
        ) : (
          <p>
            <strong>Die Anbieterangaben werden gerade ergänzt.</strong> Bis dahin erreichen Sie den Betreiber über das
            GitHub-Profil <a href="https://github.com/Fluory">@Fluory</a>.
          </p>
        )}
        <h2>Kontakt</h2>
        <p>{i.email ? <a href={`mailto:${i.email}`}>{i.email}</a> : 'E-Mail-Adresse folgt.'}</p>
        <h2>Verantwortlich für den Inhalt</h2>
        <p>
          {i.name ?? 'Der Betreiber (siehe oben)'}. Die täglichen Einträge der Insel (Titel und Lore) werden von einer
          KI-Routine (Claude) erzeugt und automatisch veröffentlicht; der Betreiber prüft sie nachträglich.
        </p>
        <h2>Streitschlichtung</h2>
        <p>
          Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
          teilzunehmen.
        </p>
      </div>
    </div>
  );
}

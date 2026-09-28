import type { Metadata } from 'next';
import { imprint } from '@/features/legal';
import { SceneDirective } from '@/features/scene';
import pageStyles from '../page.module.css';

export const metadata: Metadata = {
  title: 'Datenschutz',
  robots: { index: false },
  alternates: { canonical: '/datenschutz' },
};

export default function DatenschutzPage() {
  const i = imprint();
  return (
    <div className={`${pageStyles.narrow} ${pageStyles.page}`} lang="de">
      <SceneDirective camera="far" dim={0.8} />
      <header className={pageStyles.head}>
        <p className="eyebrow">Rechtliches</p>
        <h1 className="h2">Datenschutzerklärung</h1>
      </header>
      <div className={`${pageStyles.panel} glass ${pageStyles.prose}`}>
        <p>
          <strong>Verantwortlicher:</strong> {i.name ?? 'siehe Impressum'}
          {i.email ? (
            <>
              , <a href={`mailto:${i.email}`}>{i.email}</a>
            </>
          ) : null}
        </p>
        <h2>1. Überblick</h2>
        <p>
          Diese Website zeigt eine Pixel-Insel aus einem öffentlichen GitHub-Repository. Es gibt keine Konten, keine
          Formulare, keine Cookies, kein Tracking und keine Analyse-Dienste. Personenbezogene Daten verarbeiten wir nur,
          soweit es für die Auslieferung der Seiten technisch nötig ist (Art. 6 Abs. 1 lit. f DSGVO).
        </p>
        <h2>2. Hosting und Server-Logs</h2>
        <p>
          Die Website wird bei der Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA gehostet. Beim Aufruf
          verarbeitet Vercel technisch notwendige Daten: IP-Adresse, Zeitpunkt, aufgerufene Seite, Referrer und
          User-Agent. Diese Daten dienen ausschließlich der sicheren und stabilen Auslieferung und werden nur so lange
          gespeichert, wie es dafür nötig ist. Vercel ist unter dem EU-US Data Privacy Framework zertifiziert und bietet
          einen Auftragsverarbeitungsvertrag (Data Processing Addendum) an. Rechtsgrundlage ist unser berechtigtes
          Interesse an einer funktionierenden Website (Art. 6 Abs. 1 lit. f DSGVO).
        </p>
        <h2>3. Schriften, Bilder und 3D-Szene</h2>
        <p>
          Alle Schriften werden von dieser Website selbst ausgeliefert, es werden keine Anfragen an Google Fonts oder
          andere Drittanbieter gestellt. Bilder der Schwesterinseln werden beim Erstellen der Seite auf dem Server
          geladen und eingebettet – Ihr Browser verbindet sich dafür nicht mit GitHub. Die 3D-Szene wird vollständig in
          Ihrem Browser berechnet.
        </p>
        <h2>4. Lokaler Speicher</h2>
        <p>
          Wenn Sie den Tag-/Nacht-Schalter benutzen, speichert Ihr Browser diese Einstellung im lokalen Speicher
          (localStorage). Das geschieht nur auf Ihren ausdrücklichen Wunsch, wird nicht an uns übertragen und lässt sich
          über die Browsereinstellungen löschen (§ 25 Abs. 2 Nr. 2 TDDDG).
        </p>
        <h2>5. Links zu GitHub</h2>
        <p>
          Links zum Repository führen zu GitHub (GitHub Inc., USA). Erst wenn Sie einem Link folgen, gilt die
          Datenschutzerklärung von GitHub.
        </p>
        <h2>6. Ihre Rechte</h2>
        <p>
          Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit
          und Widerspruch (Art. 15–21 DSGVO) sowie das Recht auf Beschwerde bei einer Datenschutz-Aufsichtsbehörde.
        </p>
        <p className="muted">Stand: 2026-09-28</p>
      </div>
    </div>
  );
}

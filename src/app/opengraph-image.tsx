import { ImageResponse } from 'next/og';
import { renderIsleSvg } from '@/features/render';
import { getLatest, getStats, getWorld } from '@/features/world-data';

export const alt = 'Today on One Tile a Day – a pixel island that grows by one tile every day';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** Social preview: today's island next to the day's title. Regenerated with every deployment. */
export default function OpenGraphImage() {
  const latest = getLatest();
  const stats = getStats();
  const svg = renderIsleSvg(getWorld(), { caption: false, animated: false });
  const src = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        background: 'linear-gradient(135deg, #f7e6cf 0%, #d7ebef 55%, #a9d6df 100%)',
        padding: 48,
        gap: 48,
        alignItems: 'center',
        fontFamily: 'serif',
      }}
    >
      <img
        src={src}
        width={534}
        height={534}
        alt=""
        style={{ borderRadius: 28, boxShadow: '0 30px 60px rgba(16,33,47,.35)' }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, flex: 1 }}>
        <div
          style={{ fontSize: 26, letterSpacing: 4, color: '#3a5063', fontFamily: 'monospace' }}
        >{`DAY ${latest.day}`}</div>
        <div style={{ fontSize: 76, lineHeight: 0.95, color: '#10212f', fontWeight: 600 }}>One tile a day.</div>
        <div style={{ fontSize: 34, lineHeight: 1.2, color: '#10212f' }}>{latest.title}</div>
        <div
          style={{ fontSize: 24, color: '#3a5063' }}
        >{`${stats.land} tiles · ${stats.inhabitants} inhabitants · grown by a Claude routine`}</div>
      </div>
    </div>,
    size,
  );
}

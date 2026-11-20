import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * The site must stay fully static: anything that revalidates or renders per request reaches
 * Vercel compute and counts as Fast Origin Transfer (docs/ARCHITEKTUR.md). The build-output
 * proof is `scripts/check-static.mjs`; this test catches the usual causes early in source.
 */
function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sources(path);
    return /\.(ts|tsx|mdx)$/.test(name) && !/\.test\.ts$/.test(name) ? [path] : [];
  });
}

describe('static site (no Fast Origin Transfer)', () => {
  it('has no middleware or proxy', () => {
    for (const name of ['middleware', 'proxy']) {
      for (const ext of ['ts', 'js']) {
        expect(existsSync(`${name}.${ext}`)).toBe(false);
        expect(existsSync(`src/${name}.${ext}`)).toBe(false);
      }
    }
  });

  it('uses no revalidation or request-time rendering', () => {
    const offenders = sources('src').filter((file) =>
      /\brevalidate\s*[:=]|force-dynamic|cache:\s*['"]no-store|\bcookies\(\)|\bheaders\(\)|\bdraftMode\(\)|['"]use server['"]/.test(
        readFileSync(file, 'utf8'),
      ),
    );
    expect(offenders).toEqual([]);
  });
});

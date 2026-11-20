#!/usr/bin/env node
/**
 * Measures how many bytes of a typical visit would pass through Vercel compute
 * ("Fast Origin Transfer"), on a local production build.
 *
 * Vercel counts Fast Origin Transfer for "Vercel Functions, Middleware, Blob and Data Cache
 * (used through ISR)" – in both directions (https://vercel.com/docs/manage-cdn-usage, read
 * 2026-11-20). Fully static routes are served from the CDN and do not count.
 *
 * The script reads the build output (`.next/`) to decide which routes reach compute
 * (ISR routes, routes rendered per request, middleware/proxy), starts `next start`, drives a
 * typical visit with Playwright and sums the request + response bytes of every request that
 * hits such a route (incl. RSC prefetches). Usage:
 *
 *   npm run build && node scripts/measure-origin-transfer.mjs [/path ...]
 *
 * Env: PW_CHROMIUM (browser binary), PORT (default: random above 5000),
 *      MAX_ORIGIN_BYTES (fail if the compute bytes per visit exceed this; default: no limit).
 * Local numbers are an estimate – the real ones are in Vercel → Usage → Fast Origin Transfer.
 */
import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const DEFAULT_PAGES = ['/', '/map', '/logbook', '/chapters', '/chapters/why-one-tile', '/day/1'];
const pages = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_PAGES;
const port = Number(process.env.PORT ?? 5000 + Math.floor(Math.random() * 20000));
const base = `http://localhost:${port}`;

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

/** Routes that would reach compute on Vercel, derived from the build output. */
export function computeRoutes(dir = '.next') {
  const prerender = readJson(`${dir}/prerender-manifest.json`);
  const appRoutes = Object.values(readJson(`${dir}/app-path-routes-manifest.json`));
  const middleware = readJson(`${dir}/server/middleware-manifest.json`);
  const isr = Object.entries(prerender.routes)
    .filter(([, r]) => typeof r.initialRevalidateSeconds === 'number')
    .map(([path]) => path);
  const prerendered = new Set(Object.keys(prerender.routes));
  const ssgDynamic = new Set(
    Object.entries(prerender.dynamicRoutes)
      .filter(([, r]) => r.fallback === false)
      .map(([path]) => path),
  );
  const perRequest = appRoutes.filter(
    (r) => !prerendered.has(r) && !ssgDynamic.has(r) && !['/_not-found', '/_global-error'].includes(r),
  );
  const hasMiddleware =
    Object.keys(middleware.middleware ?? {}).length > 0 ||
    existsSync(`${dir}/server/proxy.js`) ||
    existsSync(`${dir}/server/middleware.js`);
  return { isr, perRequest, hasMiddleware };
}

function toRegex(route) {
  const body = route.replace(/\[\[?\.\.\.[^\]]+\]\]?/g, '.+').replace(/\[[^\]]+\]/g, '[^/]+');
  return new RegExp(`^${body === '/' ? '/(index)?' : body}(\\.rsc|\\.segments/.*)?$`);
}

async function main() {
  const routes = computeRoutes();
  const matchers = [...routes.isr, ...routes.perRequest].map((r) => ({ route: r, re: toRegex(r) }));
  const server = spawn('npx', ['next', 'start', '-p', String(port)], { stdio: 'ignore' });
  try {
    for (let i = 0; i < 60; i++) {
      try {
        if ((await fetch(base)).status < 500) break;
      } catch {
        /* not up yet */
      }
      await new Promise((r) => setTimeout(r, 500));
    }
    const browser = await chromium.launch({
      executablePath: process.env.PW_CHROMIUM ?? '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome',
    });
    const page = await browser.newPage();
    const tally = { all: 0, compute: 0, requests: 0, computeRequests: 0, byRoute: {} };
    const pending = [];
    page.on('requestfinished', (request) => {
      pending.push(
        (async () => {
          const url = new URL(request.url());
          if (url.origin !== base) return;
          const sizes = await request.sizes().catch(() => null);
          if (!sizes) return;
          const bytes =
            sizes.requestHeadersSize + sizes.requestBodySize + sizes.responseHeadersSize + sizes.responseBodySize;
          tally.all += bytes;
          tally.requests += 1;
          const hit = routes.hasMiddleware ? { route: '(middleware)' } : matchers.find((m) => m.re.test(url.pathname));
          if (hit) {
            tally.compute += bytes;
            tally.computeRequests += 1;
            tally.byRoute[hit.route] = (tally.byRoute[hit.route] ?? 0) + bytes;
          }
        })(),
      );
    });
    for (const path of pages) {
      await page.goto(base + path, { waitUntil: 'load' });
      await page.mouse.wheel(0, 20_000);
      await page.waitForTimeout(1500);
    }
    await Promise.all(pending);
    await browser.close();
    const mb = (b) => (b / 1e6).toFixed(3);
    console.log(
      JSON.stringify(
        {
          pages,
          computeRoutes: routes,
          requests: tally.requests,
          totalMB: mb(tally.all),
          originRequests: tally.computeRequests,
          originMB: mb(tally.compute),
          originByRoute: Object.fromEntries(Object.entries(tally.byRoute).map(([k, v]) => [k, mb(v)])),
          visitsPer10GB: tally.compute ? Math.floor(10e9 / tally.compute) : 'unbounded (no compute)',
        },
        null,
        2,
      ),
    );
    const limit = process.env.MAX_ORIGIN_BYTES;
    if (limit !== undefined && tally.compute > Number(limit)) {
      console.error(`Origin bytes per visit ${tally.compute} exceed MAX_ORIGIN_BYTES=${limit}`);
      process.exitCode = 1;
    }
  } finally {
    server.kill();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}

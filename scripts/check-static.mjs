#!/usr/bin/env node
/**
 * Fails if the production build contains anything that reaches Vercel compute per request:
 * an ISR route (revalidate), a route rendered per request, or middleware/proxy.
 * Such routes count as Fast Origin Transfer (docs/ARCHITEKTUR.md, "Fast Origin Transfer").
 * Run after `next build` (part of `npm run verify`).
 */
import { existsSync, readFileSync } from 'node:fs';

const dir = process.argv[2] ?? '.next';
const read = (p) => JSON.parse(readFileSync(`${dir}/${p}`, 'utf8'));
const prerender = read('prerender-manifest.json');
const appRoutes = Object.values(read('app-path-routes-manifest.json'));
const middleware = read('server/middleware-manifest.json');

const problems = [];
for (const [path, r] of Object.entries(prerender.routes)) {
  if (typeof r.initialRevalidateSeconds === 'number')
    problems.push(`${path}: ISR (revalidate ${r.initialRevalidateSeconds}s)`);
}
for (const [path, r] of Object.entries(prerender.dynamicRoutes)) {
  if (r.fallback !== false) problems.push(`${path}: renders unknown params on demand (set dynamicParams = false)`);
}
const known = new Set([
  ...Object.keys(prerender.routes),
  ...Object.keys(prerender.dynamicRoutes),
  '/_not-found',
  '/_global-error',
]);
for (const route of appRoutes) if (!known.has(route)) problems.push(`${route}: rendered per request`);
if (
  Object.keys(middleware.middleware ?? {}).length ||
  existsSync(`${dir}/server/proxy.js`) ||
  existsSync(`${dir}/server/middleware.js`)
) {
  problems.push('middleware/proxy present: every matched request reaches compute');
}

if (problems.length) {
  console.error(`Build is not fully static:\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log(`check-static: ${appRoutes.length} routes, all prerendered without revalidation, no middleware.`);

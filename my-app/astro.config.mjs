import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';
import db from '@astrojs/db';
import sitemap from '@astrojs/sitemap';

// Canonical site URL. Must match the Sitemap: line in public/robots.txt.
const SITE = 'https://attendancetrack75.com';

// Routes that should not appear in sitemap.xml — mirrors the Disallow
// rules in public/robots.txt (auth-gated app, onboarding flow, API).
const PRIVATE_PREFIXES = ['/app', '/onboarding', '/api'];

export default defineConfig({
  site: SITE,
  output: 'server',
  // Node adapter in standalone mode — the build emits `dist/server/entry.mjs`
  // which is deployed to Cloudflare Pages with the Node.js runtime.
  // Pages' Node.js runtime is a regular Node 22 process; no compat flags,
  // no workerd, no V8-isolate weirdness. PBKDF2 / Buffer / libsql all work
  // natively.
  adapter: node({ mode: 'standalone' }),
  integrations: [
    react(),
    db(),
    sitemap({
      // Output a single sitemap-0.xml that matches the Sitemap: URL
      // declared in public/robots.txt.
      entryLimit: 4500,
      changefreq: 'weekly',
      priority: 0.7,
      // Keep auth / app / onboarding / API routes out of the sitemap.
      // @astrojs/sitemap passes the *full URL* (e.g.
      // "https://attendancetrack75.com/app/today/"), so parse it first
      // and match on pathname only.
      filter: (page) => {
        let pathname;
        try {
          pathname = new URL(page, SITE).pathname;
        } catch {
          return false;
        }
        return !PRIVATE_PREFIXES.some(
          (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
        );
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    server: {
      watch: {
        ignored: ['**/src/styles/global.css'],
      },
      cors: {
        origin: true,
        credentials: true,
      },
    },
  },
  server: {
    host: '0.0.0.0',
  },
});

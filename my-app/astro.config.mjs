import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';
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
  // Cloudflare adapter for server-side rendering (SSR) on Cloudflare Pages
  adapter: cloudflare(),
  integrations: [
    react(),
    db(),
    sitemap({
      // Output a single sitemap-0.xml that matches the Sitemap: URL
      // declared in public/robots.txt.
      entryLimit: 4500,
      changefreq: 'weekly',
      priority: 0.7,
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
    define: {
      'process.env': '{}',
    },
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

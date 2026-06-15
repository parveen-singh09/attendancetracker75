import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';
import db from '@astrojs/db';
import sitemap from '@astrojs/sitemap';

const SITE = 'https://attendancetrack75.com';

const PRIVATE_PREFIXES = ['/app', '/onboarding', '/api'];

export default defineConfig({
  site: SITE,
  trailingSlash: 'never',
  output: 'server',
  adapter: cloudflare(),
  integrations: [
    react(),
    db(),
    sitemap({
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

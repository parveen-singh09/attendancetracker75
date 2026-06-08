import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async () => {
  // Check process.env
  const processUrl = process.env?.ASTRO_DB_REMOTE_URL || '';
  const processToken = process.env?.ASTRO_DB_APP_TOKEN || '';

  // Check globalThis
  const globalUrl = (globalThis as any).ASTRO_DB_REMOTE_URL || '';
  const globalToken = (globalThis as any).ASTRO_DB_APP_TOKEN || '';

  return new Response(
    JSON.stringify({
      message: "Diagnostics info for database credentials.",
      processEnv: {
        ASTRO_DB_REMOTE_URL: {
          defined: !!processUrl,
          length: processUrl.length,
          prefix: processUrl.slice(0, 15),
        },
        ASTRO_DB_APP_TOKEN: {
          defined: !!processToken,
          length: processToken.length,
          prefix: processToken ? processToken.slice(0, 15) : '',
        }
      },
      globalScope: {
        ASTRO_DB_REMOTE_URL: {
          defined: !!globalUrl,
          length: globalUrl.length,
          prefix: globalUrl.slice(0, 15),
        },
        ASTRO_DB_APP_TOKEN: {
          defined: !!globalToken,
          length: globalToken.length,
          prefix: globalToken ? globalToken.slice(0, 15) : '',
        }
      }
    }),
    {
      status: 200,
      headers: {
        'content-type': 'application/json',
      },
    }
  );
};

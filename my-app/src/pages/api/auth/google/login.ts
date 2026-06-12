import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  try {
    const state = globalThis.crypto.randomUUID();
    const clientId = (env as any).GOOGLE_CLIENT_ID || import.meta.env.GOOGLE_CLIENT_ID;
    const redirectUri = `${url.origin}/api/auth/google/callback`;
    const scope = encodeURIComponent('openid profile email');
    
    // Preserve which page (login vs signup) initiated the flow
    const flow = url.searchParams.get('flow') === 'signup' ? 'signup' : 'login';

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}&prompt=select_account`;

    const headers = new Headers();
    headers.set('Location', googleAuthUrl);
    headers.append('Set-Cookie', `google_oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600${import.meta.env.PROD ? '; Secure' : ''}`);
    headers.append('Set-Cookie', `google_oauth_flow=${flow}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600${import.meta.env.PROD ? '; Secure' : ''}`);

    return new Response(null, {
      status: 302,
      headers
    });
  } catch (err: any) {
    console.error('OAuth Login Error:', err);
    return new Response(`OAuth Login Error: ${err?.message || err}\n${err?.stack || ''}`, { status: 500 });
  }
};

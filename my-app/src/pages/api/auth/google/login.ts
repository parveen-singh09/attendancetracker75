import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ url, locals }) => {
  const state = crypto.randomUUID();
  const runtimeEnv = (locals as any).runtime?.env;
  const clientId = runtimeEnv?.GOOGLE_CLIENT_ID || import.meta.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${url.origin}/api/auth/google/callback`;
  const scope = encodeURIComponent('openid profile email');
  
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}&prompt=select_account`;

  const headers = new Headers();
  headers.set('Location', googleAuthUrl);
  headers.append('Set-Cookie', `google_oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600${import.meta.env.PROD ? '; Secure' : ''}`);

  return new Response(null, {
    status: 302,
    headers
  });
};

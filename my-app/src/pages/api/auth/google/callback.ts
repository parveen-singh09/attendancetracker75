import type { APIRoute } from 'astro';
import { db, User, Account, eq, and } from 'astro:db';
import { createSessionFor, buildSessionCookie } from '../../../../lib/auth';

export const prerender = false;

export const GET: APIRoute = async ({ request, url, cookies, locals }) => {
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const storedState = cookies.get('google_oauth_state')?.value;

  // 1. Verify CSRF State
  if (!code || !state || !storedState || state !== storedState) {
    return new Response('Invalid state or authentication request.', {
      status: 400,
      headers: {
        'Set-Cookie': 'google_oauth_state=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0',
      }
    });
  }

  try {
    const runtimeEnv = (locals as any).runtime?.env;
    const clientId = runtimeEnv?.GOOGLE_CLIENT_ID || import.meta.env.GOOGLE_CLIENT_ID;
    const clientSecret = runtimeEnv?.GOOGLE_CLIENT_SECRET || import.meta.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${url.origin}/api/auth/google/callback`;

    // 2. Exchange Authorization Code for Tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });
    
    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      throw new Error(`Token exchange failed: ${errText}`);
    }
    const { access_token } = await tokenRes.json() as { access_token: string };

    // 3. Fetch User Info from Google APIs
    const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    if (!userRes.ok) throw new Error('Failed to fetch user info');
    const googleUser = await userRes.json() as { email: string; sub: string; name?: string; picture?: string };

    const email = googleUser.email.trim().toLowerCase();
    const googleId = googleUser.sub;
    const now = new Date();

    // 4. Reconcile with Database
    let userId: string;
    const existingUser = (await db.select().from(User).where(eq(User.email, email)).limit(1))[0];

    if (existingUser) {
      userId = existingUser.id;
      // Link Google Account if it's not already linked
      const link = (await db.select().from(Account).where(
        and(eq(Account.userId, userId), eq(Account.providerId, 'google'))
      ).limit(1))[0];
      if (!link) {
        await db.insert(Account).values({
          id: crypto.randomUUID(),
          userId,
          providerId: 'google',
          accountId: googleId,
          createdAt: now,
          updatedAt: now,
        });
      }
    } else {
      // Register new user
      userId = crypto.randomUUID();
      await db.insert(User).values({
        id: userId,
        email,
        name: googleUser.name || 'Google User',
        image: googleUser.picture || null,
        emailVerified: true,
        isAnonymous: false,
        onboardingStep: 'welcome',
        targetPctDefault: 75,
        createdAt: now,
        updatedAt: now,
      });

      await db.insert(Account).values({
        id: crypto.randomUUID(),
        userId,
        providerId: 'google',
        accountId: googleId,
        createdAt: now,
        updatedAt: now,
      });
    }

    // 5. Establish App Session
    const { rawToken } = await createSessionFor(userId, request);
    const secure = import.meta.env.PROD || url.protocol === 'https:';
    
    // Return custom redirect Response to prevent Cloudflare immutable header errors
    const headers = new Headers();
    headers.set('Location', '/app/today');
    headers.append('Set-Cookie', 'google_oauth_state=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
    headers.append('Set-Cookie', buildSessionCookie(rawToken, secure));

    return new Response(null, {
      status: 302,
      headers
    });
  } catch (err) {
    console.error('OAuth Callback Error:', err);
    return new Response('Authentication process failed.', { status: 500 });
  }
};

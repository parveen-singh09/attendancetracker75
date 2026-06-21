import type { APIRoute } from 'astro';
import { db, User, Account, eq, and } from 'astro:db';
import { createSessionFor, buildSessionCookie } from '../../../../lib/auth';
import { env } from 'cloudflare:workers';

export const prerender = false;

export const GET: APIRoute = async ({ request, url, cookies }) => {
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const storedState = cookies.get('google_oauth_state')?.value;

  
  if (!code || !state || !storedState || state !== storedState) {
    return new Response('Invalid state or authentication request.', {
      status: 400,
      headers: {
        'Set-Cookie': 'google_oauth_state=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0',
      }
    });
  }

  try {
    const clientId = (env as any).GOOGLE_CLIENT_ID || import.meta.env.GOOGLE_CLIENT_ID;
    const clientSecret = (env as any).GOOGLE_CLIENT_SECRET || import.meta.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${url.origin}/api/auth/google/callback`;

    
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

    
    const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    if (!userRes.ok) throw new Error('Failed to fetch user info');
    const googleUser = await userRes.json() as { email: string; email_verified?: boolean; sub: string; name?: string; picture?: string };

    // Only trust a Google identity whose email Google itself has verified.
    // Otherwise an attacker could set an unverified Google email to a victim's
    // address and get auto-linked into the victim's existing account.
    if (googleUser.email_verified === false || !googleUser.email) {
      return new Response('Google account email is not verified.', {
        status: 403,
        headers: {
          'Set-Cookie': 'google_oauth_state=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0',
        },
      });
    }

    const email = googleUser.email.trim().toLowerCase();
    const googleId = googleUser.sub;
    const now = new Date();

    
    let userId: string;
    const existingUser = (await db.select().from(User).where(eq(User.email, email)).limit(1))[0];

    if (existingUser) {
      userId = existingUser.id;
      
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

    
    const { rawToken } = await createSessionFor(userId, request);
    const secure = import.meta.env.PROD || url.protocol === 'https:';
    
    
    
    const flow = state.split(':')[1] || 'login';
    let redirectTo = '/app/today';
    if (flow === 'signup') {
      const freshUser = (await db.select().from(User).where(eq(User.id, userId)).limit(1))[0];
      if (freshUser && freshUser.onboardingStep !== 'done') {
        redirectTo = '/onboarding/welcome';
      }
    }

    
    const headers = new Headers();
    headers.set('Location', redirectTo);
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

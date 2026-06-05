
type SignUp = { email: string; password: string; name: string };
type SignIn = { email: string; password: string };

type AuthSuccess = { data: { user: any; session: any; redirect: false }; error: null };
type AuthError = { data: null; error: { message: string; code?: string } };
type AuthResult = AuthSuccess | AuthError;

async function post<T = any>(path: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`Network error contacting ${path}: ${msg}`);
  }
  return res.json() as Promise<T>;
}

export const authClient = {
  async signUp(input: SignUp): Promise<AuthResult> {
    try {
      const json = await post<{ user?: any; session?: any; error?: { message: string } }>(
        '/api/auth/sign-up',
        input
      );
      if (json.error) return { data: null, error: { message: json.error.message, code: 'SIGNUP_FAILED' } };
      return { data: { user: json.user, session: json.session, redirect: false }, error: null };
    } catch (e) {
      return { data: null, error: { message: e instanceof Error ? e.message : 'Network error. Please try again.' } };
    }
  },
  async signIn(input: SignIn): Promise<AuthResult> {
    try {
      const json = await post<{ user?: any; session?: any; error?: { message: string } }>(
        '/api/auth/sign-in',
        input
      );
      if (json.error) return { data: null, error: { message: json.error.message, code: 'SIGNIN_FAILED' } };
      return { data: { user: json.user, session: json.session, redirect: false }, error: null };
    } catch (e) {
      return { data: null, error: { message: e instanceof Error ? e.message : 'Network error. Please try again.' } };
    }
  },
  async signInAnonymous(): Promise<AuthResult> {
    try {
      const json = await post<{ user?: any; session?: any; error?: { message: string } }>(
        '/api/auth/guest',
        {}
      );
      if (json.error) return { data: null, error: { message: json.error.message, code: 'GUEST_FAILED' } };
      return { data: { user: json.user, session: json.session, redirect: false }, error: null };
    } catch (e) {
      return { data: null, error: { message: e instanceof Error ? e.message : 'Network error. Please try again.' } };
    }
  },
  async getSession(): Promise<{ user: any } | null> {
    try {
      const res = await fetch('/api/auth/get-session', { credentials: 'same-origin' });
      if (!res.ok) return null;
      const json = (await res.json()) as { user?: any };
      return json.user ? { user: json.user } : null;
    } catch {
      return null;
    }
  },
  async signOut(): Promise<{ ok: boolean }> {
    try {
      await fetch('/api/auth/sign-out', { method: 'POST', credentials: 'same-origin' });
      return { ok: true };
    } catch {
      return { ok: false };
    }
  },
};

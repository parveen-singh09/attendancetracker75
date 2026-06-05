
import { db, User, Session, Account, eq } from 'astro:db';
import { randomBytes, randomUUID, pbkdf2Sync, timingSafeEqual, createHash } from 'node:crypto';

const SESSION_COOKIE = 'at75_session';
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  isAnonymous: boolean;
  onboardingStep: string;
  targetPctDefault: number;
  emailVerified: boolean;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type AuthSession = {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  updatedAt: Date;
};


const PBKDF2_ITERS = 100_000;
const PBKDF2_KEYLEN = 32;
const PBKDF2_DIGEST = 'sha256';

function hashPassword(plain: string): string {
  const salt = randomBytes(16).toString('base64');
  const hash = pbkdf2Sync(plain, salt, PBKDF2_ITERS, PBKDF2_KEYLEN, PBKDF2_DIGEST).toString('base64');
  return `pbkdf2$${PBKDF2_ITERS}$${salt}$${hash}`;
}

function verifyPassword(plain: string, stored: string): boolean {
  const parts = stored.split('$');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false;
  const iters = Number(parts[1]);
  const salt = parts[2]!;
  const expected = parts[3]!;
  if (!iters || !salt || !expected) return false;
  const actual = pbkdf2Sync(plain, salt, iters, PBKDF2_KEYLEN, PBKDF2_DIGEST).toString('base64');
  const a = Buffer.from(actual);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}


function genToken(): string {
  return randomBytes(32).toString('base64url');
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function genUserId(): string {
  return randomUUID();
}

function nowPlusTtl(): Date {
  return new Date(Date.now() + SESSION_TTL_MS);
}

function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get('cookie');
  if (!header) return null;
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return null;
}

function buildSessionCookie(token: string, secure: boolean): string {
  const parts = [
    `${SESSION_COOKIE}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`,
  ];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

function clearSessionCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

function isSecureRequest(request: Request): boolean {
  const url = new URL(request.url);
  return url.protocol === 'https:';
}

function rowToUser(row: any): AuthUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    isAnonymous: row.isAnonymous,
    onboardingStep: row.onboardingStep,
    targetPctDefault: row.targetPctDefault,
    emailVerified: row.emailVerified,
    image: row.image ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function rowToSession(row: any): AuthSession {
  return {
    id: row.id,
    userId: row.userId,
    tokenHash: row.tokenHash,
    expiresAt: row.expiresAt,
    ipAddress: row.ipAddress ?? null,
    userAgent: row.userAgent ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}


export type SignUpInput = { email: string; password: string; name: string };
export type SignInInput = { email: string; password: string };

export type AuthResult = { user: AuthUser; session: AuthSession; cookie: string };

export async function signUp(
  request: Request,
  input: SignUpInput
): Promise<{ ok: true; result: AuthResult } | { ok: false; status: number; message: string }> {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  if (!email || !input.password || !name) {
    return { ok: false, status: 400, message: 'Email, name, and password are required.' };
  }
  if (input.password.length < 8) {
    return { ok: false, status: 400, message: 'Password must be at least 8 characters.' };
  }

  const existing = await db.select().from(User).where(eq(User.email, email));
  if (existing.length > 0) {
    return { ok: false, status: 409, message: 'An account with that email already exists.' };
  }

  const now = new Date();
  const userId = genUserId();
  await db.insert(User).values({
    id: userId,
    email,
    name,
    emailVerified: false,
    isAnonymous: false,
    onboardingStep: 'welcome',
    targetPctDefault: 75,
    createdAt: now,
    updatedAt: now,
  });
  await db.insert(Account).values({
    id: genUserId(),
    userId,
    providerId: 'credential',
    accountId: email,
    password: hashPassword(input.password),
    createdAt: now,
    updatedAt: now,
  });

  const { session, rawToken } = await createSessionFor(userId, request);
  const user = (await db.select().from(User).where(eq(User.id, userId)))[0]!;
  return {
    ok: true,
    result: { user: rowToUser(user), session, cookie: buildSessionCookie(rawToken, isSecureRequest(request)) },
  };
}

export async function signIn(
  request: Request,
  input: SignInInput
): Promise<{ ok: true; result: AuthResult } | { ok: false; status: number; message: string }> {
  const email = input.email.trim().toLowerCase();
  const userRows = await db.select().from(User).where(eq(User.email, email));
  const userRow = userRows[0];
  if (!userRow) {
    return { ok: false, status: 401, message: 'Invalid email or password.' };
  }
  const acctRows = await db
    .select()
    .from(Account)
    .where(eq(Account.userId, userRow.id));
  const credential = acctRows.find((a) => a.providerId === 'credential');
  if (!credential?.password || !verifyPassword(input.password, credential.password)) {
    return { ok: false, status: 401, message: 'Invalid email or password.' };
  }
  const { session, rawToken } = await createSessionFor(userRow.id, request);
  return {
    ok: true,
    result: { user: rowToUser(userRow), session, cookie: buildSessionCookie(rawToken, isSecureRequest(request)) },
  };
}

export async function signInAnonymous(
  request: Request
): Promise<{ ok: true; result: AuthResult } | { ok: false; status: number; message: string }> {
  const now = new Date();
  const userId = genUserId();
  const guestEmail = `guest-${userId}@guest.local`;
  await db.insert(User).values({
    id: userId,
    email: guestEmail,
    name: 'Guest',
    emailVerified: false,
    isAnonymous: true,
    onboardingStep: 'welcome',
    targetPctDefault: 75,
    createdAt: now,
    updatedAt: now,
  });
  await db.insert(Account).values({
    id: genUserId(),
    userId,
    providerId: 'anonymous',
    accountId: userId,
    password: null,
    createdAt: now,
    updatedAt: now,
  });

  const { session, rawToken } = await createSessionFor(userId, request);
  const user = (await db.select().from(User).where(eq(User.id, userId)))[0]!;
  return {
    ok: true,
    result: { user: rowToUser(user), session, cookie: buildSessionCookie(rawToken, isSecureRequest(request)) },
  };
}

export async function getSession(
  request: Request
): Promise<{ user: AuthUser; session: AuthSession } | null> {
  const token = readCookie(request, SESSION_COOKIE);
  if (!token) return null;
  const tokenHash = hashToken(token);
  const sessionRows = await db.select().from(Session).where(eq(Session.tokenHash, tokenHash));
  const session = sessionRows[0];
  if (!session) return null;
  if (session.expiresAt.getTime() < Date.now()) {
    await db.delete(Session).where(eq(Session.id, session.id));
    return null;
  }
  const userRows = await db.select().from(User).where(eq(User.id, session.userId));
  const user = userRows[0];
  if (!user) return null;
  return { user: rowToUser(user), session: rowToSession(session) };
}

export async function signOut(
  request: Request
): Promise<{ ok: true; cookie: string }> {
  const token = readCookie(request, SESSION_COOKIE);
  if (token) {
    const tokenHash = hashToken(token);
    await db.delete(Session).where(eq(Session.tokenHash, tokenHash));
  }
  return { ok: true, cookie: clearSessionCookie() };
}


async function createSessionFor(userId: string, request: Request): Promise<{ session: AuthSession; rawToken: string }> {
  const now = new Date();
  const id = genUserId();
  const token = genToken();
  const tokenHash = hashToken(token);
  const ip = request.headers.get('cf-connecting-ip') ?? request.headers.get('x-forwarded-for') ?? null;
  const ua = request.headers.get('user-agent') ?? null;
  await db.insert(Session).values({
    id,
    userId,
    tokenHash,
    expiresAt: nowPlusTtl(),
    ipAddress: ip,
    userAgent: ua,
    createdAt: now,
    updatedAt: now,
  });
  return {
    rawToken: token,
    session: {
      id,
      userId,
      tokenHash,
      expiresAt: nowPlusTtl(),
      ipAddress: ip,
      userAgent: ua,
      createdAt: now,
      updatedAt: now,
    },
  };
}

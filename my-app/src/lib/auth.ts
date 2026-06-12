import { db, User, Session, Account, AcademicSession, Subject, TimetableSlot, Day, AttendanceLog, eq } from 'astro:db';

const SESSION_COOKIE = 'at75_session';
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; 

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

function randomBytes(n: number): Uint8Array {
  const buf = new Uint8Array(n);
  globalThis.crypto.getRandomValues(buf);
  return buf;
}

function toBase64(bytes: Uint8Array): string {
  
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]!);
  return btoa(s);
}

function fromBase64(b64: string): Uint8Array {
  const s = atob(b64);
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}

function toBase64Url(bytes: Uint8Array): string {
  return toBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function toHex(bytes: Uint8Array): string {
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += bytes[i]!.toString(16).padStart(2, '0');
  return s;
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i]! ^ b[i]!;
  return diff === 0;
}

async function pbkdf2(plain: string, saltB64: string, iters: number, keyLen: number): Promise<Uint8Array> {
  const enc = new TextEncoder();
  const key = await globalThis.crypto.subtle.importKey(
    'raw',
    enc.encode(plain),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  const bits = await globalThis.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: fromBase64(saltB64) as BufferSource,
      iterations: iters,
      hash: 'SHA-256',
    },
    key,
    keyLen * 8
  );
  return new Uint8Array(bits);
}

async function sha256Hex(input: string): Promise<string> {
  const enc = new TextEncoder();
  const buf = await globalThis.crypto.subtle.digest('SHA-256', enc.encode(input));
  return toHex(new Uint8Array(buf));
}

async function hashPassword(plain: string): Promise<string> {
  const salt = toBase64(randomBytes(16));
  const hash = toBase64(await pbkdf2(plain, salt, PBKDF2_ITERS, PBKDF2_KEYLEN));
  return `pbkdf2$${PBKDF2_ITERS}$${salt}$${hash}`;
}

async function verifyPassword(plain: string, stored: string): Promise<boolean> {
  const parts = stored.split('$');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false;
  const iters = Number(parts[1]);
  const salt = parts[2]!;
  const expected = parts[3]!;
  if (!iters || !salt || !expected) return false;
  const actual = toBase64(await pbkdf2(plain, salt, iters, PBKDF2_KEYLEN));
  return constantTimeEqual(fromBase64(actual), fromBase64(expected));
}

function genToken(): string {
  return toBase64Url(randomBytes(32));
}

async function hashToken(token: string): Promise<string> {
  return sha256Hex(token);
}

function genUserId(): string {
  return globalThis.crypto.randomUUID();
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

export function buildSessionCookie(token: string, secure: boolean): string {
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
    password: await hashPassword(input.password),
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
  if (!credential?.password || !(await verifyPassword(input.password, credential.password))) {
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
    onboardingStep: 'done',
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

  
  const sessionId = genUserId();
  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 4);
  
  const yyyy = startDate.getFullYear();
  const mm = String(startDate.getMonth() + 1).padStart(2, '0');
  const dd = String(startDate.getDate()).padStart(2, '0');
  const startDateStr = `${yyyy}-${mm}-${dd}`;
  
  const eyyyy = endDate.getFullYear();
  const emm = String(endDate.getMonth() + 1).padStart(2, '0');
  const edd = String(endDate.getDate()).padStart(2, '0');
  const endDateStr = `${eyyyy}-${emm}-${edd}`;
  
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const sessionName = `${monthNames[startDate.getMonth()]} ${startDate.getMonth() < 5 ? 'Spring' : startDate.getMonth() < 8 ? 'Summer' : 'Fall'} ${startDate.getFullYear()}`;

  await db.insert(AcademicSession).values({
    id: sessionId,
    userId,
    name: sessionName,
    startDate: startDateStr,
    endDate: endDateStr,
    targetPct: 75,
    overallCalcMode: 'subject',
    isArchived: false,
    createdAt: now,
  });

  
  const defaultSubjects = [
    { name: 'Mathematics', color: '#3b82f6' },
    { name: 'Physics', color: '#ef4444' },
    { name: 'Chemistry', color: '#10b981' },
    { name: 'English', color: '#8b5cf6' },
  ];

  for (const sub of defaultSubjects) {
    await db.insert(Subject).values({
      id: genUserId(),
      sessionId,
      name: sub.name,
      color: sub.color,
      credits: 3,
      isLab: false,
      createdAt: now,
    });
  }

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
  const tokenHash = await hashToken(token);
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
    const tokenHash = await hashToken(token);
    const sessionRows = await db.select().from(Session).where(eq(Session.tokenHash, tokenHash));
    const session = sessionRows[0];
    if (session) {
      const userRows = await db.select().from(User).where(eq(User.id, session.userId));
      const user = userRows[0];
      if (user && user.isAnonymous) {
        const userId = user.id;
        
        const userSessions = await db.select({ id: AcademicSession.id }).from(AcademicSession).where(eq(AcademicSession.userId, userId));
        for (const sess of userSessions) {
          await db.delete(AttendanceLog).where(eq(AttendanceLog.sessionId, sess.id));
          await db.delete(TimetableSlot).where(eq(TimetableSlot.sessionId, sess.id));
          await db.delete(Day).where(eq(Day.sessionId, sess.id));
          await db.delete(Subject).where(eq(Subject.sessionId, sess.id));
        }
        await db.delete(AcademicSession).where(eq(AcademicSession.userId, userId));
        await db.delete(Account).where(eq(Account.userId, userId));
        await db.delete(Session).where(eq(Session.userId, userId));
        await db.delete(User).where(eq(User.id, userId));
      } else {
        
        await db.delete(Session).where(eq(Session.tokenHash, tokenHash));
      }
    }
  }
  return { ok: true, cookie: clearSessionCookie() };
}

export async function createSessionFor(userId: string, request: Request): Promise<{ session: AuthSession; rawToken: string }> {
  const now = new Date();
  const id = genUserId();
  const token = genToken();
  const tokenHash = await hashToken(token);
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

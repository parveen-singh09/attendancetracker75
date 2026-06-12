import type { APIRoute } from 'astro';
import { z } from 'zod';
import { db, Subject, TimetableSlot, AttendanceLog, AcademicSession, User, eq, inArray } from 'astro:db';
import { inTransaction } from '../../../lib/tx';

export const prerender = false;

const slotSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  subjectTempId: z.string(),
  location: z.string().max(80).nullish(),
});

const putSchema = z.object({
  subjects: z.array(z.object({
    tempId: z.string(),
    name: z.string().min(1).max(80),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    isLab: z.boolean().default(false),
  })).default([]),
  slots: z.array(slotSchema).default([]),
});

export const GET: APIRoute = async ({ url, locals }) => {
  const user = locals.user;
  if (!user) return json({ error: { code: 'unauth', message: 'Login required' } }, 401);
  const sessionId = url.searchParams.get('sessionId');
  if (!sessionId) return json({ error: { code: 'invalid', message: 'sessionId required' } }, 400);
  const sess = (await db.select().from(AcademicSession).where(eq(AcademicSession.id, sessionId)).limit(1))[0];
  if (!sess || sess.userId !== user.id) return json({ error: { code: 'notfound', message: 'Not found' } }, 404);
  const subjs = await db.select().from(Subject).where(eq(Subject.sessionId, sessionId));
  const slots = await db.select().from(TimetableSlot).where(eq(TimetableSlot.sessionId, sessionId));
  return json({ data: { subjects: subjs, slots } });
};

export const PUT: APIRoute = async ({ request, url, locals }) => {
  const user = locals.user;
  if (!user) return json({ error: { code: 'unauth', message: 'Login required' } }, 401);
  const sessionId = url.searchParams.get('sessionId');
  if (!sessionId) return json({ error: { code: 'invalid', message: 'sessionId required' } }, 400);
  const sess = (await db.select().from(AcademicSession).where(eq(AcademicSession.id, sessionId)).limit(1))[0];
  if (!sess || sess.userId !== user.id) return json({ error: { code: 'notfound', message: 'Not found' } }, 404);

  const body = await request.json().catch(() => null);
  const parsed = putSchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: { code: 'invalid', message: 'Invalid input', issues: parsed.error.issues } }, 400);
  }

  
  
  
  
  
  
  
  
  
  

  const now = new Date();

  await inTransaction(async (tx) => {
    const existing = await tx
      .select()
      .from(Subject)
      .where(eq(Subject.sessionId, sessionId));

    
    const existingById = new Map<string, typeof existing[number]>();
    for (const e of existing) {
      existingById.set(e.id, e);
    }

    const tempToId = new Map<string, string>();
    const newSubjectRows: Array<typeof Subject.$inferInsert> = [];
    const subjectsToDelete: string[] = [];

    for (const s of parsed.data.subjects) {
      const found = existingById.get(s.tempId);
      if (found) {
        
        if (found.name !== s.name || found.color !== s.color || found.isLab !== s.isLab) {
          await tx
            .update(Subject)
            .set({ name: s.name, color: s.color, isLab: s.isLab })
            .where(eq(Subject.id, found.id));
        }
        tempToId.set(s.tempId, found.id);
        
        existingById.delete(found.id);
      } else {
        
        
        tempToId.set(s.tempId, s.tempId);
        newSubjectRows.push({
          id: s.tempId,
          sessionId,
          name: s.name,
          color: s.color,
          isLab: s.isLab,
          createdAt: now,
        });
      }
    }

    
    
    
    
    
    for (const leftover of existingById.values()) {
      subjectsToDelete.push(leftover.id);
    }
    if (subjectsToDelete.length) {
      await tx.delete(TimetableSlot).where(inArray(TimetableSlot.subjectId, subjectsToDelete));
      await tx.delete(AttendanceLog).where(inArray(AttendanceLog.subjectId, subjectsToDelete));
      await tx.delete(Subject).where(inArray(Subject.id, subjectsToDelete));
    }
    if (newSubjectRows.length) {
      await tx.insert(Subject).values(newSubjectRows);
    }

    
    
    
    
    
    await tx.delete(TimetableSlot).where(eq(TimetableSlot.sessionId, sessionId));
    const slotRows = parsed.data.slots
      .map((slot) => {
        const subjectId = tempToId.get(slot.subjectTempId);
        if (!subjectId) return null;
        return {
          id: crypto.randomUUID(),
          sessionId,
          subjectId,
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
          location: slot.location ?? null,
          createdAt: now,
        };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);
    if (slotRows.length) await tx.insert(TimetableSlot).values(slotRows);
  });

  
  
  await db
    .update(User)
    .set({ onboardingStep: 'done', updatedAt: now })
    .where(eq(User.id, user.id));

  return json({ data: { ok: true } });
};

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: { 'content-type': 'application/json' } });
}

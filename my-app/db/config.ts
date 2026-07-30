import { defineDb, defineTable, column, NOW } from 'astro:db';
const User = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    email: column.text({ unique: true }),
    name: column.text(),
    emailVerified: column.boolean({ default: false }),
    image: column.text({ optional: true }),
    isAnonymous: column.boolean({ default: false }),
    onboardingStep: column.text({ default: 'welcome' }),
    targetPctDefault: column.number({ default: 75 }),
    createdAt: column.date({ default: NOW }),
    updatedAt: column.date({ default: NOW }),
  },
});

const Session = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    userId: column.text({ references: () => User.columns.id }),
    tokenHash: column.text({ unique: true }),
    expiresAt: column.date(),
    ipAddress: column.text({ optional: true }),
    userAgent: column.text({ optional: true }),
    createdAt: column.date({ default: NOW }),
    updatedAt: column.date({ default: NOW }),
  },
});

const Account = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    userId: column.text({ references: () => User.columns.id }),
    providerId: column.text(),
    accountId: column.text(),
    password: column.text({ optional: true }),
    createdAt: column.date({ default: NOW }),
    updatedAt: column.date({ default: NOW }),
  },
});


const AcademicSession = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    userId: column.text({ references: () => User.columns.id }),
    name: column.text(),
    startDate: column.text(),
    endDate: column.text(),
    targetPct: column.number({ default: 75 }),
    overallCalcMode: column.text({ default: 'subject' }),
    isArchived: column.boolean({ default: false }),
    createdAt: column.date({ default: NOW }),
  },
});

const Subject = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    sessionId: column.text({ references: () => AcademicSession.columns.id, onDelete: 'cascade' }),
    name: column.text(),
    code: column.text({ optional: true }),
    color: column.text({ default: '#3b82f6' }),
    credits: column.number({ default: 0 }),
    minPct: column.number({ optional: true }),
    isLab: column.boolean({ default: false }),
    // Manual correction applied on top of the logged/backfilled counts, for when
    // the college register disagrees with what was marked here.
    adjHeld: column.number({ default: 0 }),
    adjAttended: column.number({ default: 0 }),
    createdAt: column.date({ default: NOW }),
  },
});

const TimetableSlot = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    sessionId: column.text({ references: () => AcademicSession.columns.id, onDelete: 'cascade' }),
    subjectId: column.text({ references: () => Subject.columns.id, onDelete: 'cascade' }),
    dayOfWeek: column.number(),
    startTime: column.text(),
    endTime: column.text(),
    location: column.text({ optional: true }),
    createdAt: column.date({ default: NOW }),
  },
});

const Day = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    sessionId: column.text({ references: () => AcademicSession.columns.id, onDelete: 'cascade' }),
    date: column.text(),
    status: column.text({ default: 'normal' }),
    note: column.text({ optional: true }),
    createdAt: column.date({ default: NOW }),
  },
});

const AttendanceLog = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    sessionId: column.text({ references: () => AcademicSession.columns.id, onDelete: 'cascade' }),
    subjectId: column.text({ references: () => Subject.columns.id, onDelete: 'cascade' }),
    date: column.text(),
    status: column.text(),
    note: column.text({ optional: true }),
    createdAt: column.date({ default: NOW }),
    updatedAt: column.date({ default: NOW }),
  },
});

export default defineDb({
  tables: {
    User,
    Session,
    Account,
    AcademicSession,
    Subject,
    TimetableSlot,
    Day,
    AttendanceLog,
  },
});

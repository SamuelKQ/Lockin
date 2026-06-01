import {
  pgTable,
  text,
  timestamp,
  boolean,
  serial,
  integer,
  real,
  jsonb,
} from 'drizzle-orm/pg-core'

// --- Better Auth required tables -------------------------------------------
// Column names are camelCase to match Better Auth's defaults. Do not rename.

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// --- App tables ------------------------------------------------------------

// One row per user per calendar day. Holds all the daily habit tracking.
export const dailyLog = pgTable('daily_log', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  date: text('date').notNull(), // YYYY-MM-DD

  // Faith
  bibleDone: boolean('bibleDone').notNull().default(false),
  biblePassage: text('biblePassage'),
  prayerNote: text('prayerNote'),

  // Body
  weightKg: real('weightKg'),
  workoutDone: boolean('workoutDone').notNull().default(false),
  ranToday: boolean('ranToday').notNull().default(false),
  runDistanceKm: real('runDistanceKm'),
  dietOnTrack: boolean('dietOnTrack').notNull().default(false),

  // Mind
  readDone: boolean('readDone').notNull().default(false),
  bookTitle: text('bookTitle'),
  pagesRead: integer('pagesRead'),

  // Career (did at least one application / career action today)
  jobActionDone: boolean('jobActionDone').notNull().default(false),

  notes: text('notes'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

// Job application tracker.
export const jobApplication = pgTable('job_application', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  link: text('link').notNull(),
  company: text('company'),
  role: text('role'),
  northStar: text('northStar'), // why this job / what it moves toward
  status: text('status').notNull().default('applied'), // applied | interview | offer | rejected | ghosted
  notes: text('notes'),
  appliedAt: timestamp('appliedAt').notNull().defaultNow(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

// Project / goal breakdown tasks (samlungu.com, zonse live, UK Home Office, etc.)
export const projectTask = pgTable('project_task', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  project: text('project').notNull(), // samlungu | zonse | ukho | general
  title: text('title').notNull(),
  done: boolean('done').notNull().default(false),
  dueDate: text('dueDate'), // YYYY-MM-DD
  sortOrder: integer('sortOrder').notNull().default(0),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

// Weekly review entries, used to generate the PDF report.
export const weeklyReview = pgTable('weekly_review', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  weekNumber: integer('weekNumber').notNull(),
  weekStart: text('weekStart').notNull(), // YYYY-MM-DD
  weekEnd: text('weekEnd').notNull(), // YYYY-MM-DD
  wins: text('wins'),
  struggles: text('struggles'),
  lessons: text('lessons'),
  nextWeekFocus: text('nextWeekFocus'),
  rating: integer('rating'), // 1-10 self score
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

// Web push subscriptions for reminders.
export const pushSubscription = pgTable('push_subscription', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  endpoint: text('endpoint').notNull().unique(),
  subscription: jsonb('subscription').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

// Per-user reminder time settings (HH:MM 24h strings).
export const reminderSettings = pgTable('reminder_settings', {
  userId: text('userId').primaryKey(),
  bibleTime: text('bibleTime').default('06:00'),
  readTime: text('readTime').default('21:30'),
  weighTime: text('weighTime').default('06:30'),
  jobTime: text('jobTime').default('10:00'),
  bibleEnabled: boolean('bibleEnabled').notNull().default(true),
  readEnabled: boolean('readEnabled').notNull().default(true),
  weighEnabled: boolean('weighEnabled').notNull().default(true),
  jobEnabled: boolean('jobEnabled').notNull().default(true),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

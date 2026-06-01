// The 40-day "Lock In" program definition.
// Day 1 = Monday, June 1, 2026.

export const PROGRAM_START = "2026-06-01" // Monday
export const PROGRAM_DAYS = 40
export const START_WEIGHT = 89 // kg
export const GOAL_WEIGHT = 70 // kg by end of year
export const JOB_TARGET = 40 // applications
export const RUNS_PER_WEEK = 2

// ---- Date helpers (all in local YYYY-MM-DD form) ----

export function toDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export function parseDateStr(s: string): Date {
  const [y, m, d] = s.split("-").map(Number)
  return new Date(y, m - 1, d)
}

export function todayStr(): string {
  return toDateStr(new Date())
}

export function addDays(s: string, n: number): string {
  const d = parseDateStr(s)
  d.setDate(d.getDate() + n)
  return toDateStr(d)
}

// Day index in the program (1-based). Returns null if outside the window.
export function programDay(dateStr: string): number | null {
  const start = parseDateStr(PROGRAM_START)
  const cur = parseDateStr(dateStr)
  const diff = Math.round((cur.getTime() - start.getTime()) / 86400000)
  if (diff < 0 || diff >= PROGRAM_DAYS) return null
  return diff + 1
}

// Which program week (1-based) a date belongs to. Weeks are Mon-Sun.
export function programWeek(dateStr: string): number {
  const day = programDay(dateStr)
  if (day === null) return 0
  return Math.ceil(day / 7)
}

// Start (Mon) and end (Sun) date strings for a given program week number.
export function weekRange(weekNumber: number): { start: string; end: string } {
  const start = addDays(PROGRAM_START, (weekNumber - 1) * 7)
  const end = addDays(start, 6)
  return { start, end }
}

export const TOTAL_WEEKS = Math.ceil(PROGRAM_DAYS / 7) // 6 weeks (last is partial)

// ---- Daily bodyweight workout, progressively scaled by week ----

export type WorkoutSet = { name: string; target: string }

export function workoutForWeek(week: number): WorkoutSet[] {
  // Base reps scale up each week. Week clamps to 1..6.
  const w = Math.min(Math.max(week, 1), 6)
  const pushups = 15 + (w - 1) * 5 // 15,20,25,30,35,40
  const squats = 20 + (w - 1) * 5 // 20..45
  const plankSec = 30 + (w - 1) * 10 // 30..80
  const lunges = 10 + (w - 1) * 2 // per leg
  return [
    { name: "Push-ups", target: `3 x ${pushups}` },
    { name: "Bodyweight squats", target: `3 x ${squats}` },
    { name: "Plank", target: `3 x ${plankSec}s` },
    { name: "Reverse lunges", target: `3 x ${lunges}/leg` },
    { name: "Glute bridges", target: `3 x ${squats}` },
  ]
}

// Target weight trajectory: linear glide from 89 toward an interim 40-day goal.
// We aim for a realistic ~0.6kg/week over the 40 days (~3.4kg), landing near 85.5kg,
// keeping 70kg as the EOY north star.
export const INTERIM_GOAL_WEIGHT = 85.5

export function targetWeightForDay(day: number): number {
  const frac = (day - 1) / (PROGRAM_DAYS - 1)
  return +(START_WEIGHT - (START_WEIGHT - INTERIM_GOAL_WEIGHT) * frac).toFixed(1)
}

// ---- The fixed daily disciplines (habits tracked every day) ----

export const DAILY_HABITS = [
  { key: "bibleDone", label: "Bible + Prayer", hint: "Read a passage, sit with God" },
  { key: "workoutDone", label: "Bodyweight workout", hint: "No-equipment circuit" },
  { key: "dietOnTrack", label: "Diet on track", hint: "Stayed in your plan today" },
  { key: "readDone", label: "Read before sleep", hint: "A few pages of your book" },
  { key: "jobActionDone", label: "Job action", hint: "Applied or re-strategized" },
] as const

export type HabitKey = (typeof DAILY_HABITS)[number]["key"]

// ---- High-level goals shown on the goals board ----

export const GOALS = [
  { id: "god", title: "Reconnect with God", detail: "Daily Bible reading + prayer habit" },
  { id: "weight", title: "Lose weight", detail: `89kg → ${INTERIM_GOAL_WEIGHT}kg in 40 days (70kg by EOY)` },
  { id: "jobs", title: "Apply to 40+ jobs", detail: "Apply & always re-strategize" },
  { id: "run", title: "Run 2x / week", detail: "No fixed days — log when you run" },
  { id: "read", title: "Read a book before sleep", detail: "Finish at least one book" },
  { id: "samlungu", title: "Ship samlungu.com", detail: "Brand strategist site + your character" },
  { id: "zonse", title: "Build Zonse Live", detail: "Keep moving the site forward" },
  { id: "ukho", title: "Apply to UK Home Office", detail: "Complete and submit the application" },
] as const

// ---- Project task buckets (for the projects board) ----
export const PROJECTS = ["samlungu.com", "Zonse Live", "UK Home Office"] as const
export type ProjectName = (typeof PROJECTS)[number]

import type { DailyLogRow } from "@/app/actions/daily"
import { DAILY_HABITS } from "@/lib/program"

export type WeekStats = {
  bible: number
  workout: number
  diet: number
  read: number
  job: number
  runs: number
  daysLogged: number
  totalDays: number
  startWeight: number | null
  endWeight: number | null
  weightDelta: number | null
  consistency: number // 0-100 across the 5 daily habits
}

export function summarizeLogs(logs: DailyLogRow[], totalDays: number): WeekStats {
  let bible = 0,
    workout = 0,
    diet = 0,
    read = 0,
    job = 0,
    runs = 0
  const weights: { date: string; w: number }[] = []

  for (const l of logs) {
    if (l.bibleDone) bible++
    if (l.workoutDone) workout++
    if (l.dietOnTrack) diet++
    if (l.readDone) read++
    if (l.jobActionDone) job++
    if (l.ranToday) runs++
    if (l.weightKg != null) weights.push({ date: l.date, w: l.weightKg })
  }

  weights.sort((a, b) => a.date.localeCompare(b.date))
  const startWeight = weights.length ? weights[0].w : null
  const endWeight = weights.length ? weights[weights.length - 1].w : null
  const weightDelta = startWeight != null && endWeight != null ? +(endWeight - startWeight).toFixed(1) : null

  const habitTotal = (bible + workout + diet + read + job)
  const possible = totalDays * DAILY_HABITS.length
  const consistency = possible > 0 ? Math.round((habitTotal / possible) * 100) : 0

  return {
    bible,
    workout,
    diet,
    read,
    job,
    runs,
    daysLogged: logs.length,
    totalDays,
    startWeight,
    endWeight,
    weightDelta,
    consistency,
  }
}

// Current streak of consecutive days (ending today/yesterday) where at least
// 3 of 5 daily habits were completed.
export function computeStreak(logs: DailyLogRow[], todayStr: string): number {
  const map = new Map(logs.map((l) => [l.date, l]))
  let streak = 0
  const cur = new Date(todayStr + "T00:00:00")

  // If today not logged yet, start counting from yesterday so streak isn't broken mid-day.
  const todayLog = map.get(todayStr)
  const todayQualifies = todayLog ? qualifies(todayLog) : false
  if (!todayQualifies) cur.setDate(cur.getDate() - 1)

  while (true) {
    const ds = fmt(cur)
    const log = map.get(ds)
    if (log && qualifies(log)) {
      streak++
      cur.setDate(cur.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

function qualifies(l: DailyLogRow): boolean {
  const count = [l.bibleDone, l.workoutDone, l.dietOnTrack, l.readDone, l.jobActionDone].filter(Boolean).length
  return count >= 3
}

function fmt(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { TopBar, BottomNav } from "@/components/app-nav"
import { WeightChart } from "@/components/weight-chart"
import { ConsistencyChart } from "@/components/consistency-chart"
import { StatGrid } from "@/components/stat-grid"
import { getAllLogs } from "@/app/actions/daily"
import { getJobs } from "@/app/actions/jobs"
import {
  programDay,
  targetWeightForDay,
  parseDateStr,
  PROGRAM_DAYS,
  START_WEIGHT,
  INTERIM_GOAL_WEIGHT,
} from "@/lib/program"
import { summarizeLogs, computeStreak } from "@/lib/stats"
import { todayStr } from "@/lib/program"

export default async function ProgressPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in")

  const [logs, jobs] = await Promise.all([getAllLogs(), getJobs()])
  const today = todayStr()

  const weightData = logs
    .filter((l) => l.weightKg != null)
    .map((l) => {
      const d = programDay(l.date) ?? 1
      return {
        date: l.date,
        label: parseDateStr(l.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        weight: l.weightKg as number,
        target: targetWeightForDay(d),
      }
    })

  const dayNow = programDay(today) ?? 1
  const stats = summarizeLogs(logs, dayNow)
  const streak = computeStreak(logs, today)

  const habitData = [
    { label: "Bible", value: stats.bible },
    { label: "Workout", value: stats.workout },
    { label: "Diet", value: stats.diet },
    { label: "Read", value: stats.read },
    { label: "Jobs", value: stats.job },
  ]

  const latest = weightData.length ? weightData[weightData.length - 1].weight : null
  const lost = latest != null ? +(START_WEIGHT - latest).toFixed(1) : 0
  const toGoal = latest != null ? +(latest - INTERIM_GOAL_WEIGHT).toFixed(1) : null

  return (
    <div className="flex min-h-svh flex-col">
      <TopBar name={session.user.name} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-5">
        <div className="mb-4">
          <h1 className="text-xl font-bold tracking-tight">Progress</h1>
          <p className="text-sm text-muted-foreground">The whole 40 days at a glance.</p>
        </div>
        <div className="flex flex-col gap-4">
          <StatGrid
            items={[
              { label: "Day", value: `${dayNow}/${PROGRAM_DAYS}` },
              { label: "Streak", value: `${streak}d` },
              { label: "Consistency", value: `${stats.consistency}%` },
              { label: "Runs", value: `${stats.runs}` },
              { label: "Weight lost", value: `${lost}kg` },
              { label: "To goal", value: toGoal != null ? `${toGoal}kg` : "—" },
              { label: "Apps sent", value: `${jobs.length}` },
              { label: "Days logged", value: `${stats.daysLogged}` },
            ]}
          />
          <WeightChart data={weightData} />
          <ConsistencyChart
            data={habitData}
            title="Discipline totals"
            suffix={`Across ${dayNow} days. Each bar is how many days you completed that discipline.`}
          />
        </div>
      </main>
      <BottomNav />
    </div>
  )
}

"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { jobApplication } from "@/lib/db/schema"
import { and, eq, gte, lte } from "drizzle-orm"
import { headers } from "next/headers"
import { getLogsBetween } from "@/app/actions/daily"
import { getReview } from "@/app/actions/review"
import { weekRange } from "@/lib/program"
import { summarizeLogs } from "@/lib/stats"
import type { ReportData } from "@/lib/report-pdf"

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")
  return session.user
}

export async function buildReportData(weekNumber: number): Promise<ReportData> {
  const u = await getUserId()
  const { start, end } = weekRange(weekNumber)

  const logs = await getLogsBetween(start, end)
  const review = await getReview(weekNumber)

  // count days that have actually occurred in this week window (cap at 7)
  const totalDays = 7
  const stats = summarizeLogs(logs, totalDays)

  // job apps within the week
  const weekApps = await db
    .select()
    .from(jobApplication)
    .where(
      and(
        eq(jobApplication.userId, u.id),
        gte(jobApplication.appliedAt, new Date(start + "T00:00:00")),
        lte(jobApplication.appliedAt, new Date(end + "T23:59:59")),
      ),
    )

  const allApps = await db.select().from(jobApplication).where(eq(jobApplication.userId, u.id))

  return {
    weekNumber,
    weekStart: start,
    weekEnd: end,
    name: u.name,
    stats: {
      bible: stats.bible,
      workout: stats.workout,
      diet: stats.diet,
      read: stats.read,
      job: stats.job,
      runs: stats.runs,
      daysLogged: stats.daysLogged,
      totalDays,
      consistency: stats.consistency,
      startWeight: stats.startWeight,
      endWeight: stats.endWeight,
      weightDelta: stats.weightDelta,
    },
    appsThisWeek: weekApps.length,
    totalApps: allApps.length,
    review: {
      wins: review?.wins,
      struggles: review?.struggles,
      lessons: review?.lessons,
      nextWeekFocus: review?.nextWeekFocus,
      rating: review?.rating,
    },
  }
}

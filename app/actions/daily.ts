"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { dailyLog } from "@/lib/db/schema"
import { and, eq, gte, lte, asc } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")
  return session.user.id
}

export type DailyLogRow = typeof dailyLog.$inferSelect

export async function getDailyLog(date: string): Promise<DailyLogRow | null> {
  const userId = await getUserId()
  const [row] = await db
    .select()
    .from(dailyLog)
    .where(and(eq(dailyLog.userId, userId), eq(dailyLog.date, date)))
    .limit(1)
  return row ?? null
}

export async function getLogsBetween(start: string, end: string): Promise<DailyLogRow[]> {
  const userId = await getUserId()
  return db
    .select()
    .from(dailyLog)
    .where(and(eq(dailyLog.userId, userId), gte(dailyLog.date, start), lte(dailyLog.date, end)))
    .orderBy(asc(dailyLog.date))
}

export async function getAllLogs(): Promise<DailyLogRow[]> {
  const userId = await getUserId()
  return db
    .select()
    .from(dailyLog)
    .where(eq(dailyLog.userId, userId))
    .orderBy(asc(dailyLog.date))
}

type UpsertInput = Partial<Omit<DailyLogRow, "id" | "userId" | "createdAt" | "updatedAt" | "date">> & {
  date: string
}

export async function upsertDailyLog(input: UpsertInput) {
  const userId = await getUserId()
  const { date, ...fields } = input

  const existing = await getDailyLog(date)
  if (existing) {
    await db
      .update(dailyLog)
      .set({ ...fields, updatedAt: new Date() })
      .where(and(eq(dailyLog.userId, userId), eq(dailyLog.date, date)))
  } else {
    await db.insert(dailyLog).values({ userId, date, ...fields })
  }
  revalidatePath("/")
  revalidatePath("/progress")
  revalidatePath("/review")
}

export async function toggleHabit(date: string, key: string, value: boolean) {
  const userId = await getUserId()
  console.log("[v0] toggleHabit called", { userId, date, key, value })
  const allowed = ["bibleDone", "workoutDone", "dietOnTrack", "readDone", "jobActionDone", "ranToday"]
  if (!allowed.includes(key)) throw new Error("Invalid habit")

  try {
    const existing = await getDailyLog(date)
    if (existing) {
      await db
        .update(dailyLog)
        .set({ [key]: value, updatedAt: new Date() })
        .where(and(eq(dailyLog.userId, userId), eq(dailyLog.date, date)))
    } else {
      await db.insert(dailyLog).values({ userId, date, [key]: value })
    }
    console.log("[v0] toggleHabit wrote OK")
  } catch (e) {
    console.log("[v0] toggleHabit ERROR", (e as Error).message)
    throw e
  }
  revalidatePath("/")
}

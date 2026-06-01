"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { weeklyReview } from "@/lib/db/schema"
import { and, desc, eq } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { weekRange } from "@/lib/program"

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")
  return session.user.id
}

export type ReviewRow = typeof weeklyReview.$inferSelect

export async function getReviews(): Promise<ReviewRow[]> {
  const userId = await getUserId()
  return db
    .select()
    .from(weeklyReview)
    .where(eq(weeklyReview.userId, userId))
    .orderBy(desc(weeklyReview.weekNumber))
}

export async function getReview(weekNumber: number): Promise<ReviewRow | null> {
  const userId = await getUserId()
  const [row] = await db
    .select()
    .from(weeklyReview)
    .where(and(eq(weeklyReview.userId, userId), eq(weeklyReview.weekNumber, weekNumber)))
    .limit(1)
  return row ?? null
}

export async function saveReview(input: {
  weekNumber: number
  wins?: string
  struggles?: string
  lessons?: string
  nextWeekFocus?: string
  rating?: number
}) {
  const userId = await getUserId()
  const { start, end } = weekRange(input.weekNumber)
  const existing = await getReview(input.weekNumber)
  const data = {
    wins: input.wins ?? null,
    struggles: input.struggles ?? null,
    lessons: input.lessons ?? null,
    nextWeekFocus: input.nextWeekFocus ?? null,
    rating: input.rating ?? null,
  }
  if (existing) {
    await db
      .update(weeklyReview)
      .set(data)
      .where(and(eq(weeklyReview.userId, userId), eq(weeklyReview.weekNumber, input.weekNumber)))
  } else {
    await db.insert(weeklyReview).values({
      userId,
      weekNumber: input.weekNumber,
      weekStart: start,
      weekEnd: end,
      ...data,
    })
  }
  revalidatePath("/review")
}

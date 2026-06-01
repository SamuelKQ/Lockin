"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { jobApplication } from "@/lib/db/schema"
import { and, desc, eq } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")
  return session.user.id
}

export type JobRow = typeof jobApplication.$inferSelect

export async function getJobs(): Promise<JobRow[]> {
  const userId = await getUserId()
  return db
    .select()
    .from(jobApplication)
    .where(eq(jobApplication.userId, userId))
    .orderBy(desc(jobApplication.appliedAt))
}

export async function addJob(input: {
  link: string
  company?: string
  role?: string
  northStar?: string
  notes?: string
  appliedAt?: string
}) {
  const userId = await getUserId()
  if (!input.link?.trim()) throw new Error("Link is required")
  await db.insert(jobApplication).values({
    userId,
    link: input.link.trim(),
    company: input.company?.trim() || null,
    role: input.role?.trim() || null,
    northStar: input.northStar?.trim() || null,
    notes: input.notes?.trim() || null,
    appliedAt: input.appliedAt ? new Date(input.appliedAt) : new Date(),
  })
  revalidatePath("/jobs")
  revalidatePath("/")
}

export async function updateJobStatus(id: number, status: string) {
  const userId = await getUserId()
  await db
    .update(jobApplication)
    .set({ status })
    .where(and(eq(jobApplication.id, id), eq(jobApplication.userId, userId)))
  revalidatePath("/jobs")
}

export async function deleteJob(id: number) {
  const userId = await getUserId()
  await db
    .delete(jobApplication)
    .where(and(eq(jobApplication.id, id), eq(jobApplication.userId, userId)))
  revalidatePath("/jobs")
  revalidatePath("/")
}

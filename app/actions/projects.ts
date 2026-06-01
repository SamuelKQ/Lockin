"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { projectTask } from "@/lib/db/schema"
import { and, asc, eq } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")
  return session.user.id
}

export type ProjectTaskRow = typeof projectTask.$inferSelect

export async function getProjectTasks(): Promise<ProjectTaskRow[]> {
  const userId = await getUserId()
  return db
    .select()
    .from(projectTask)
    .where(eq(projectTask.userId, userId))
    .orderBy(asc(projectTask.sortOrder), asc(projectTask.id))
}

export async function addProjectTask(input: { project: string; title: string; dueDate?: string }) {
  const userId = await getUserId()
  if (!input.title?.trim()) throw new Error("Title required")
  await db.insert(projectTask).values({
    userId,
    project: input.project,
    title: input.title.trim(),
    dueDate: input.dueDate || null,
  })
  revalidatePath("/projects")
  revalidatePath("/")
}

export async function toggleProjectTask(id: number, done: boolean) {
  const userId = await getUserId()
  await db
    .update(projectTask)
    .set({ done })
    .where(and(eq(projectTask.id, id), eq(projectTask.userId, userId)))
  revalidatePath("/projects")
  revalidatePath("/")
}

export async function deleteProjectTask(id: number) {
  const userId = await getUserId()
  await db
    .delete(projectTask)
    .where(and(eq(projectTask.id, id), eq(projectTask.userId, userId)))
  revalidatePath("/projects")
}

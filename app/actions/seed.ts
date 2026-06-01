"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { projectTask } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")
  return session.user.id
}

const STARTER: { project: string; titles: string[] }[] = [
  {
    project: "samlungu.com",
    titles: [
      "Define positioning: brand strategist + your character",
      "Outline pages (home, work, about, contact)",
      "Gather 3-5 case studies / projects to feature",
      "Write the about story (who you are beyond work)",
      "Design the homepage",
      "Build and deploy v1",
      "Connect domain samlungu.com",
    ],
  },
  {
    project: "Zonse Live",
    titles: [
      "Clarify Zonse Live concept + audience",
      "Define core pages / features",
      "Build landing page",
      "Set up content / data structure",
      "Launch first version",
    ],
  },
  {
    project: "UK Home Office",
    titles: [
      "Gather all required documents",
      "Confirm eligibility + route",
      "Draft application",
      "Review with a second pair of eyes",
      "Submit application",
    ],
  },
]

export async function seedStarterTasks() {
  const userId = await getUserId()
  const existing = await db.select().from(projectTask).where(eq(projectTask.userId, userId)).limit(1)
  if (existing.length > 0) return { seeded: false }

  const rows = STARTER.flatMap((p, pi) =>
    p.titles.map((title, i) => ({
      userId,
      project: p.project,
      title,
      sortOrder: pi * 100 + i,
    })),
  )
  await db.insert(projectTask).values(rows)
  revalidatePath("/projects")
  return { seeded: true }
}

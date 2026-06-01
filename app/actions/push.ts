"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { pushSubscription, reminderSettings } from "@/lib/db/schema"
import { and, eq } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { getWebPush } from "@/lib/push"

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")
  return session.user.id
}

export async function savePushSubscription(sub: PushSubscriptionJSON) {
  const userId = await getUserId()
  const endpoint = sub.endpoint
  if (!endpoint) throw new Error("Invalid subscription")

  const [existing] = await db
    .select()
    .from(pushSubscription)
    .where(eq(pushSubscription.endpoint, endpoint))
    .limit(1)

  if (existing) {
    await db
      .update(pushSubscription)
      .set({ userId, subscription: sub })
      .where(eq(pushSubscription.endpoint, endpoint))
  } else {
    await db.insert(pushSubscription).values({ userId, endpoint, subscription: sub })
  }
}

export async function removePushSubscription(endpoint: string) {
  const userId = await getUserId()
  await db
    .delete(pushSubscription)
    .where(and(eq(pushSubscription.endpoint, endpoint), eq(pushSubscription.userId, userId)))
}

export async function sendTestNotification() {
  const userId = await getUserId()
  const wp = getWebPush()
  if (!wp) return { ok: false, message: "Push keys not configured yet." }

  const subs = await db.select().from(pushSubscription).where(eq(pushSubscription.userId, userId))
  if (subs.length === 0) return { ok: false, message: "No device subscribed. Enable notifications first." }

  const payload = JSON.stringify({
    title: "Lock In — test nudge",
    body: "Notifications are working. Time to show up.",
    url: "/",
  })

  let sent = 0
  for (const s of subs) {
    try {
      await wp.sendNotification(s.subscription as webPushSub, payload)
      sent++
    } catch {
      // stale subscription — clean it up
      await db.delete(pushSubscription).where(eq(pushSubscription.id, s.id))
    }
  }
  return { ok: sent > 0, message: sent > 0 ? "Sent!" : "Could not deliver." }
}

type webPushSub = Parameters<NonNullable<ReturnType<typeof getWebPush>>["sendNotification"]>[0]

// ---- Reminder settings ----

export type ReminderSettingsRow = typeof reminderSettings.$inferSelect

export async function getReminderSettings(): Promise<ReminderSettingsRow> {
  const userId = await getUserId()
  const [row] = await db
    .select()
    .from(reminderSettings)
    .where(eq(reminderSettings.userId, userId))
    .limit(1)
  if (row) return row
  const [created] = await db.insert(reminderSettings).values({ userId }).returning()
  return created
}

export async function saveReminderSettings(input: Partial<Omit<ReminderSettingsRow, "userId" | "updatedAt">>) {
  const userId = await getUserId()
  const existing = await db
    .select()
    .from(reminderSettings)
    .where(eq(reminderSettings.userId, userId))
    .limit(1)
  if (existing.length) {
    await db
      .update(reminderSettings)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(reminderSettings.userId, userId))
  } else {
    await db.insert(reminderSettings).values({ userId, ...input })
  }
  revalidatePath("/settings")
}

"use client"

import { useEffect, useState, useTransition } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Bell, BellOff, Send } from "lucide-react"
import {
  pushSupported,
  subscribeToPush,
  unsubscribeFromPush,
  getCurrentSubscription,
  registerServiceWorker,
} from "@/lib/push-client"
import { savePushSubscription, removePushSubscription, sendTestNotification, saveReminderSettings } from "@/app/actions/push"
import type { ReminderSettingsRow } from "@/app/actions/push"

const REMINDERS = [
  { key: "bible", label: "Bible + Prayer", timeField: "bibleTime", enField: "bibleEnabled" },
  { key: "weigh", label: "Daily weigh-in", timeField: "weighTime", enField: "weighEnabled" },
  { key: "job", label: "Job application", timeField: "jobTime", enField: "jobEnabled" },
  { key: "read", label: "Read before sleep", timeField: "readTime", enField: "readEnabled" },
] as const

export function NotificationSettings({
  vapidPublicKey,
  settings,
}: {
  vapidPublicKey: string | null
  settings: ReminderSettingsRow
}) {
  const [supported, setSupported] = useState(true)
  const [subscribed, setSubscribed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [, startTransition] = useTransition()

  const [form, setForm] = useState(settings)

  useEffect(() => {
    setSupported(pushSupported())
    registerServiceWorker()
    getCurrentSubscription().then((s) => setSubscribed(!!s))
  }, [])

  const enable = async () => {
    if (!vapidPublicKey) {
      toast.error("Push keys not configured yet. Add VAPID keys to enable.")
      return
    }
    setBusy(true)
    try {
      const sub = await subscribeToPush(vapidPublicKey)
      await savePushSubscription(sub as PushSubscriptionJSON)
      setSubscribed(true)
      toast.success("Reminders enabled on this device")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not enable")
    } finally {
      setBusy(false)
    }
  }

  const disable = async () => {
    setBusy(true)
    try {
      const endpoint = await unsubscribeFromPush()
      if (endpoint) await removePushSubscription(endpoint)
      setSubscribed(false)
      toast.success("Reminders disabled on this device")
    } catch {
      toast.error("Could not disable")
    } finally {
      setBusy(false)
    }
  }

  const test = () => {
    startTransition(async () => {
      const res = await sendTestNotification()
      res.ok ? toast.success(res.message) : toast.error(res.message)
    })
  }

  const update = (patch: Partial<ReminderSettingsRow>) => {
    const next = { ...form, ...patch }
    setForm(next)
    startTransition(async () => {
      await saveReminderSettings(patch)
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Bell className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold">Push notifications</h2>
            <p className="mt-0.5 text-sm text-muted-foreground leading-relaxed">
              {supported
                ? "Get nudged before each daily thing. Install the app to your home screen first for reliable delivery."
                : "This browser doesn't support push. On iPhone, install to home screen (Share → Add to Home Screen), then open from there."}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {!subscribed ? (
            <Button onClick={enable} disabled={busy || !supported}>
              <Bell className="mr-1.5 h-4 w-4" /> {busy ? "Enabling..." : "Enable on this device"}
            </Button>
          ) : (
            <>
              <Button onClick={test} variant="default">
                <Send className="mr-1.5 h-4 w-4" /> Send test
              </Button>
              <Button onClick={disable} disabled={busy} variant="outline" className="bg-transparent">
                <BellOff className="mr-1.5 h-4 w-4" /> Disable
              </Button>
            </>
          )}
        </div>
        {!vapidPublicKey && (
          <p className="mt-3 rounded-md bg-muted/50 p-2 text-xs text-muted-foreground">
            Note: VAPID push keys aren&apos;t set yet, so delivery is disabled. Add them in project settings to turn on
            real notifications.
          </p>
        )}
      </Card>

      <Card className="p-5">
        <h2 className="mb-1 text-base font-semibold">Reminder times</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          We&apos;ll nudge you ~20 min before each time so you can get to it.
        </p>
        <ul className="flex flex-col gap-3">
          {REMINDERS.map((r) => {
            const time = form[r.timeField] as string
            const enabled = form[r.enField] as boolean
            return (
              <li key={r.key} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                <div className="min-w-0 flex-1">
                  <Label className="text-sm font-medium">{r.label}</Label>
                </div>
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => update({ [r.timeField]: e.target.value } as Partial<ReminderSettingsRow>)}
                  className="h-9 w-28"
                  disabled={!enabled}
                />
                <Switch
                  checked={enabled}
                  onCheckedChange={(v) => update({ [r.enField]: v } as Partial<ReminderSettingsRow>)}
                />
              </li>
            )
          })}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
          Times are checked every 10 minutes by the server. Keep notifications enabled on at least one installed device.
        </p>
      </Card>
    </div>
  )
}

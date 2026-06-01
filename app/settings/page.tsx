import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { TopBar, BottomNav } from "@/components/app-nav"
import { NotificationSettings } from "@/components/notification-settings"
import { SignOutButton } from "@/components/sign-out-button"
import { ICSExport } from "@/components/ics-export"
import { getReminderSettings } from "@/app/actions/push"
import { Card } from "@/components/ui/card"

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in")

  const settings = await getReminderSettings()
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? null

  return (
    <div className="flex min-h-svh flex-col">
      <TopBar name={session.user.name} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-5">
        <div className="mb-4">
          <h1 className="text-xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">Reminders, your account, and the app.</p>
        </div>
        <div className="flex flex-col gap-4">
          <NotificationSettings vapidPublicKey={vapidPublicKey} settings={settings} />
          <ICSExport initialTimes={{
            bible: settings?.bibleTime ?? "06:00",
            read: settings?.readTime ?? "21:30",
            job: settings?.jobTime ?? "10:00",
            weigh: settings?.weighTime ?? "07:00",
          }} />

          <Card className="p-5">
            <h2 className="mb-1 text-base font-semibold">Account</h2>
            <p className="text-sm text-muted-foreground">
              {session.user.name} · {session.user.email}
            </p>
            <div className="mt-4">
              <SignOutButton />
            </div>
          </Card>
        </div>
      </main>
      <BottomNav />
    </div>
  )
}

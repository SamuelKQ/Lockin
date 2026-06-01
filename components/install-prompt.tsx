"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Download, Bell } from "lucide-react"
import Link from "next/link"

export function InstallPrompt() {
  const [dismissed, setDismissed] = useState(true)
  const [isStandalone, setIsStandalone] = useState(true)

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS Safari
      window.navigator.standalone === true
    setIsStandalone(standalone)
    const wasDismissed = localStorage.getItem("install-dismissed") === "1"
    setDismissed(wasDismissed)
  }, [])

  if (isStandalone || dismissed) return null

  return (
    <Card className="relative border-primary/30 bg-primary/5 p-4">
      <button
        onClick={() => {
          localStorage.setItem("install-dismissed", "1")
          setDismissed(true)
        }}
        className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-start gap-3 pr-6">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Download className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">Install Lock In on your phone</p>
          <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
            Add to your home screen for one-tap access and reminder notifications. On iPhone: Share → Add to Home
            Screen. Then enable nudges in Settings.
          </p>
          <Button asChild size="sm" variant="outline" className="mt-2 h-8 bg-transparent">
            <Link href="/settings">
              <Bell className="mr-1.5 h-3.5 w-3.5" /> Set up reminders
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  )
}

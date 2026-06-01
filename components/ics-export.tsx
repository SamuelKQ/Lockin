"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CalendarDays } from "lucide-react"
import { PROGRAM_START, PROGRAM_DAYS } from "@/lib/program"

const DEFAULT_TIMES: Record<string, string> = {
  bible: "06:00",
  workout: "06:30",
  read: "21:30",
  job: "10:00",
  weigh: "07:00",
}

const LABELS: Record<string, string> = {
  bible: "Bible + Prayer",
  workout: "Bodyweight Workout",
  read: "Read before sleep",
  job: "Job action",
  weigh: "Weigh in",
}

export function ICSExport({ initialTimes }: { initialTimes?: Record<string, string> }) {
  const [times, setTimes] = useState({ ...DEFAULT_TIMES, ...(initialTimes ?? {}) })

  const generate = () => {
    const startDate = PROGRAM_START.replace(/-/g, "")
    let cal = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//LockIn//40Days//EN\r\nCALSCALE:GREGORIAN\r\n"

    Object.entries(times).forEach(([key, time]) => {
      const name = LABELS[key] ?? key
      const tm = time.replace(":", "") + "00"
      cal += [
        "BEGIN:VEVENT",
        `UID:lockin-${key}-2026@samlungu`,
        `DTSTART:${startDate}T${tm}`,
        "DURATION:PT10M",
        `RRULE:FREQ=DAILY;COUNT=${PROGRAM_DAYS}`,
        `SUMMARY:🔒 ${name}`,
        "BEGIN:VALARM",
        "ACTION:DISPLAY",
        `DESCRIPTION:${name}`,
        "TRIGGER:-PT20M",
        "END:VALARM",
        "END:VEVENT\r\n",
      ].join("\r\n")
    })

    cal += "END:VCALENDAR\r\n"

    const blob = new Blob([cal], { type: "text/calendar" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "lockin-40-day-reminders.ics"
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center gap-2">
        <CalendarDays className="h-5 w-5 text-primary" />
        <div>
          <h2 className="text-base font-semibold">Calendar reminders</h2>
          <p className="text-xs text-muted-foreground">
            Set your times, download the .ics, import it once to your phone calendar. It pings you 20 min early, every day for {PROGRAM_DAYS} days.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Object.entries(LABELS).map(([key, label]) => (
          <div key={key} className="flex flex-col gap-1">
            <Label htmlFor={`t_${key}`} className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              {label}
            </Label>
            <Input
              id={`t_${key}`}
              type="time"
              value={times[key]}
              onChange={(e) => setTimes((prev) => ({ ...prev, [key]: e.target.value }))}
              className="h-9"
            />
          </div>
        ))}
      </div>
      <Button onClick={generate} variant="outline" className="mt-4 w-full bg-transparent">
        Download reminders (.ics)
      </Button>
    </Card>
  )
}

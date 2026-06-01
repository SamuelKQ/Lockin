"use client"

import { useState, useTransition } from "react"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { toggleHabit, type DailyLogRow } from "@/app/actions/daily"
import { BookOpen, Dumbbell, Salad, BookMarked, Briefcase } from "lucide-react"
import type { LucideIcon } from "lucide-react"

const HABITS: { key: keyof DailyLogRow; label: string; hint: string; icon: LucideIcon }[] = [
  { key: "bibleDone", label: "Bible + Prayer", hint: "Read a passage, sit with God", icon: BookOpen },
  { key: "workoutDone", label: "Bodyweight workout", hint: "No-equipment circuit", icon: Dumbbell },
  { key: "dietOnTrack", label: "Diet on track", hint: "Stayed in your plan", icon: Salad },
  { key: "readDone", label: "Read before sleep", hint: "A few pages of your book", icon: BookMarked },
  { key: "jobActionDone", label: "Job action", hint: "Applied or re-strategized", icon: Briefcase },
]

export function DailyChecklist({ date, log }: { date: string; log: DailyLogRow | null }) {
  const [state, setState] = useState<Record<string, boolean>>({
    bibleDone: log?.bibleDone ?? false,
    workoutDone: log?.workoutDone ?? false,
    dietOnTrack: log?.dietOnTrack ?? false,
    readDone: log?.readDone ?? false,
    jobActionDone: log?.jobActionDone ?? false,
  })
  const [, startTransition] = useTransition()

  const onToggle = (key: string, value: boolean) => {
    setState((s) => ({ ...s, [key]: value }))
    startTransition(async () => {
      await toggleHabit(date, key, value)
    })
  }

  const done = Object.values(state).filter(Boolean).length

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">Daily disciplines</h2>
          <p className="text-sm text-muted-foreground">{done} of 5 done today</p>
        </div>
        <div className="text-2xl font-bold tabular-nums text-primary">
          {done}/5
        </div>
      </div>
      <ul className="flex flex-col gap-2">
        {HABITS.map((h) => {
          const checked = state[h.key as string]
          const Icon = h.icon
          return (
            <li key={h.key as string}>
              <label
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 transition-colors",
                  checked ? "bg-primary/10 border-primary/30" : "hover:bg-accent",
                )}
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={(v) => onToggle(h.key as string, Boolean(v))}
                  className="h-5 w-5"
                />
                <Icon className={cn("h-5 w-5 shrink-0", checked ? "text-primary" : "text-muted-foreground")} />
                <div className="min-w-0 flex-1">
                  <p className={cn("text-sm font-medium leading-tight", checked && "text-primary")}>{h.label}</p>
                  <p className="truncate text-xs text-muted-foreground">{h.hint}</p>
                </div>
              </label>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}

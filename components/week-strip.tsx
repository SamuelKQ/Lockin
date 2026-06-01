import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { weekRange, addDays, parseDateStr } from "@/lib/program"
import type { DailyLogRow } from "@/app/actions/daily"

export function WeekStrip({
  weekNumber,
  logs,
  today,
}: {
  weekNumber: number
  logs: DailyLogRow[]
  today: string
}) {
  const { start } = weekRange(weekNumber)
  const map = new Map(logs.map((l) => [l.date, l]))
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i))

  const score = (l?: DailyLogRow) => {
    if (!l) return 0
    return [l.bibleDone, l.workoutDone, l.dietOnTrack, l.readDone, l.jobActionDone].filter(Boolean).length
  }

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Week {weekNumber}</h2>
        <span className="text-xs text-muted-foreground">Mon – Sun</span>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((d) => {
          const l = map.get(d)
          const s = score(l)
          const isToday = d === today
          const dow = parseDateStr(d).toLocaleDateString("en-US", { weekday: "narrow" })
          const dayNum = parseDateStr(d).getDate()
          return (
            <div key={d} className="flex flex-col items-center gap-1">
              <span className="text-[10px] text-muted-foreground">{dow}</span>
              <div
                className={cn(
                  "flex h-9 w-full flex-col items-center justify-center rounded-md border text-xs font-medium",
                  isToday ? "border-primary" : "border-border",
                  s === 5 && "bg-primary text-primary-foreground",
                  s >= 3 && s < 5 && "bg-primary/30",
                  s > 0 && s < 3 && "bg-primary/10",
                )}
                title={`${s}/5 disciplines`}
              >
                {dayNum}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

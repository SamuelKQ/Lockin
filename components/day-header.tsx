import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Flame, Target, Trophy } from "lucide-react"

export function DayHeader({
  programDay,
  totalDays,
  dateLabel,
  streak,
  targetWeight,
  latestWeight,
  goalWeight,
}: {
  programDay: number | null
  totalDays: number
  dateLabel: string
  streak: number
  targetWeight: number
  latestWeight: number | null
  goalWeight: number
}) {
  const pct = programDay ? Math.round((programDay / totalDays) * 100) : 0

  return (
    <Card className="overflow-hidden p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{dateLabel}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-balance">
            {programDay ? (
              <>
                Day {programDay}
                <span className="text-muted-foreground"> / {totalDays}</span>
              </>
            ) : (
              "Lock In starts June 1"
            )}
          </h1>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-primary">
          <Flame className="h-4 w-4" />
          <span className="text-sm font-semibold tabular-nums">{streak}</span>
        </div>
      </div>

      {programDay && (
        <div className="mt-4">
          <Progress value={pct} className="h-2" />
          <p className="mt-1.5 text-xs text-muted-foreground">{pct}% through the 40 days</p>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-border p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Target className="h-3.5 w-3.5" /> Today&apos;s target
          </div>
          <p className="mt-1 text-lg font-semibold tabular-nums">{targetWeight} kg</p>
        </div>
        <div className="rounded-lg border border-border p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Trophy className="h-3.5 w-3.5" /> Current
          </div>
          <p className="mt-1 text-lg font-semibold tabular-nums">
            {latestWeight != null ? `${latestWeight} kg` : "—"}
          </p>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
        North star: reach <span className="font-medium text-foreground">{goalWeight}kg by end of year</span>. Stay in
        the daily plan and the body follows.
      </p>
    </Card>
  )
}

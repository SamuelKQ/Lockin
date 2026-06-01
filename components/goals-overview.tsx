import { Card } from "@/components/ui/card"
import { GOALS } from "@/lib/program"
import { Sparkles, Dumbbell, Briefcase, Footprints, BookMarked, Globe, Radio, FileCheck } from "lucide-react"
import type { LucideIcon } from "lucide-react"

const ICONS: Record<string, LucideIcon> = {
  god: Sparkles,
  weight: Dumbbell,
  jobs: Briefcase,
  run: Footprints,
  read: BookMarked,
  samlungu: Globe,
  zonse: Radio,
  ukho: FileCheck,
}

export function GoalsOverview() {
  return (
    <Card className="p-5">
      <h2 className="mb-3 text-base font-semibold">The 8 goals</h2>
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {GOALS.map((g) => {
          const Icon = ICONS[g.id] ?? Sparkles
          return (
            <li key={g.id} className="flex items-start gap-2.5 rounded-lg border border-border p-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium leading-tight">{g.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground leading-snug">{g.detail}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}

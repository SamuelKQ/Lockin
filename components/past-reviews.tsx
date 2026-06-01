"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { ReviewRow } from "@/app/actions/review"
import { buildReportData } from "@/app/actions/report"
import { generateWeeklyReport } from "@/lib/report-pdf"
import { useTransition } from "react"
import { toast } from "sonner"
import { FileDown } from "lucide-react"

export function PastReviews({ reviews }: { reviews: ReviewRow[] }) {
  const [pending, startTransition] = useTransition()

  if (reviews.length === 0) return null

  const download = (week: number) => {
    startTransition(async () => {
      try {
        const data = await buildReportData(week)
        generateWeeklyReport(data)
      } catch {
        toast.error("Could not generate PDF")
      }
    })
  }

  return (
    <Card className="p-5">
      <h2 className="mb-3 text-base font-semibold">Past reviews</h2>
      <ul className="flex flex-col gap-2">
        {reviews.map((r) => (
          <li key={r.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Week {r.weekNumber}</span>
                {r.rating != null && (
                  <Badge variant="outline" className="border-primary/30 text-primary">
                    {r.rating}/10
                  </Badge>
                )}
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {r.weekStart} – {r.weekEnd}
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              disabled={pending}
              onClick={() => download(r.weekNumber)}
              aria-label={`Download week ${r.weekNumber} PDF`}
            >
              <FileDown className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>
    </Card>
  )
}

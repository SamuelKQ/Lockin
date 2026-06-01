"use client"

import { useState, useTransition } from "react"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { saveReview, type ReviewRow } from "@/app/actions/review"
import { buildReportData } from "@/app/actions/report"
import { generateWeeklyReport } from "@/lib/report-pdf"
import { toast } from "sonner"
import { FileDown, Save } from "lucide-react"

export function ReviewForm({
  weeks,
  currentWeek,
  initialReview,
}: {
  weeks: number[]
  currentWeek: number
  initialReview: ReviewRow | null
}) {
  const [week, setWeek] = useState(currentWeek)
  const [wins, setWins] = useState(initialReview?.wins ?? "")
  const [struggles, setStruggles] = useState(initialReview?.struggles ?? "")
  const [lessons, setLessons] = useState(initialReview?.lessons ?? "")
  const [nextWeekFocus, setNextWeekFocus] = useState(initialReview?.nextWeekFocus ?? "")
  const [rating, setRating] = useState<number>(initialReview?.rating ?? 7)
  const [pending, startTransition] = useTransition()
  const [exporting, setExporting] = useState(false)

  const onWeekChange = async (w: string) => {
    const n = Number.parseInt(w)
    setWeek(n)
    // Pull that week's saved review if any
    startTransition(async () => {
      const res = await fetch(`/api/review?week=${n}`).then((r) => r.json()).catch(() => null)
      if (res?.review) {
        setWins(res.review.wins ?? "")
        setStruggles(res.review.struggles ?? "")
        setLessons(res.review.lessons ?? "")
        setNextWeekFocus(res.review.nextWeekFocus ?? "")
        setRating(res.review.rating ?? 7)
      } else {
        setWins("")
        setStruggles("")
        setLessons("")
        setNextWeekFocus("")
        setRating(7)
      }
    })
  }

  const save = () => {
    startTransition(async () => {
      await saveReview({ weekNumber: week, wins, struggles, lessons, nextWeekFocus, rating })
      toast.success(`Week ${week} review saved`)
    })
  }

  const exportPdf = async () => {
    setExporting(true)
    try {
      // Save first so the PDF reflects the latest text
      await saveReview({ weekNumber: week, wins, struggles, lessons, nextWeekFocus, rating })
      const data = await buildReportData(week)
      generateWeeklyReport(data)
      toast.success("PDF downloaded")
    } catch {
      toast.error("Could not generate PDF")
    } finally {
      setExporting(false)
    }
  }

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">Sunday review</h2>
        <Select value={String(week)} onValueChange={onWeekChange}>
          <SelectTrigger className="h-9 w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {weeks.map((w) => (
              <SelectItem key={w} value={String(w)}>
                Week {w}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-4">
        <Field label="Wins — what went well?" value={wins} onChange={setWins} placeholder="Showed up 6/7 days..." />
        <Field
          label="Struggles — where did you slip?"
          value={struggles}
          onChange={setStruggles}
          placeholder="Missed two read sessions..."
        />
        <Field
          label="Lessons — what did you learn?"
          value={lessons}
          onChange={setLessons}
          placeholder="Morning Bible time sticks better than night..."
        />
        <Field
          label="Focus for next week"
          value={nextWeekFocus}
          onChange={setNextWeekFocus}
          placeholder="Lock the second run in early..."
        />

        <div className="flex flex-col gap-2">
          <Label className="text-xs">Self rating: {rating}/10</Label>
          <Slider
            value={[rating]}
            min={1}
            max={10}
            step={1}
            onValueChange={(v) => setRating(v[0])}
            className="py-2"
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={save} disabled={pending} className="flex-1">
            <Save className="mr-1.5 h-4 w-4" />
            {pending ? "Saving..." : "Save review"}
          </Button>
          <Button onClick={exportPdf} disabled={exporting} variant="outline" className="flex-1 bg-transparent">
            <FileDown className="mr-1.5 h-4 w-4" />
            {exporting ? "Building..." : "Export PDF"}
          </Button>
        </div>
      </div>
    </Card>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs">{label}</Label>
      <Textarea rows={2} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

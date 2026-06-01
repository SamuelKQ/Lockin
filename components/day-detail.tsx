"use client"

import { useState, useTransition } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { upsertDailyLog, type DailyLogRow } from "@/app/actions/daily"
import { toast } from "sonner"
import { Footprints, Scale } from "lucide-react"

export function DayDetail({ date, log }: { date: string; log: DailyLogRow | null }) {
  const [weight, setWeight] = useState(log?.weightKg?.toString() ?? "")
  const [ran, setRan] = useState(log?.ranToday ?? false)
  const [runDistance, setRunDistance] = useState(log?.runDistanceKm?.toString() ?? "")
  const [passage, setPassage] = useState(log?.biblePassage ?? "")
  const [book, setBook] = useState(log?.bookTitle ?? "")
  const [pages, setPages] = useState(log?.pagesRead?.toString() ?? "")
  const [notes, setNotes] = useState(log?.notes ?? "")
  const [pending, startTransition] = useTransition()

  const save = () => {
    startTransition(async () => {
      await upsertDailyLog({
        date,
        weightKg: weight ? Number.parseFloat(weight) : null,
        ranToday: ran,
        runDistanceKm: runDistance ? Number.parseFloat(runDistance) : null,
        biblePassage: passage || null,
        bookTitle: book || null,
        pagesRead: pages ? Number.parseInt(pages) : null,
        notes: notes || null,
      })
      toast.success("Day saved")
    })
  }

  return (
    <Card className="p-5">
      <h2 className="mb-4 text-base font-semibold">Log the details</h2>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="weight" className="flex items-center gap-1.5 text-xs">
              <Scale className="h-3.5 w-3.5" /> Weight (kg)
            </Label>
            <Input
              id="weight"
              type="number"
              inputMode="decimal"
              step="0.1"
              placeholder="89.0"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pages" className="text-xs">
              Pages read
            </Label>
            <Input
              id="pages"
              type="number"
              inputMode="numeric"
              placeholder="20"
              value={pages}
              onChange={(e) => setPages(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <Label htmlFor="ran" className="flex items-center gap-2 text-sm">
            <Footprints className="h-4 w-4 text-muted-foreground" /> Did you run today?
          </Label>
          <Switch id="ran" checked={ran} onCheckedChange={setRan} />
        </div>

        {ran && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dist" className="text-xs">
              Run distance (km)
            </Label>
            <Input
              id="dist"
              type="number"
              inputMode="decimal"
              step="0.1"
              placeholder="5.0"
              value={runDistance}
              onChange={(e) => setRunDistance(e.target.value)}
            />
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="passage" className="text-xs">
            Bible passage
          </Label>
          <Input
            id="passage"
            placeholder="e.g. Psalm 23"
            value={passage}
            onChange={(e) => setPassage(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="book" className="text-xs">
            Book you're reading
          </Label>
          <Input id="book" placeholder="Title" value={book} onChange={(e) => setBook(e.target.value)} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="notes" className="text-xs">
            Notes / reflection
          </Label>
          <Textarea
            id="notes"
            rows={3}
            placeholder="How did today go?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <Button onClick={save} disabled={pending} className="w-full">
          {pending ? "Saving..." : "Save day"}
        </Button>
      </div>
    </Card>
  )
}

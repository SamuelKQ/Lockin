"use client"

import { useState, useTransition } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { addJob, updateJobStatus, deleteJob, type JobRow } from "@/app/actions/jobs"
import { JOB_TARGET } from "@/lib/program"
import { toast } from "sonner"
import { ExternalLink, Plus, Trash2, Compass, Sparkles } from "lucide-react"

const STATUSES = ["applied", "interview", "offer", "rejected", "ghosted"]

const statusStyles: Record<string, string> = {
  applied: "bg-chart-3/15 text-chart-3 border-chart-3/30",
  interview: "bg-primary/15 text-primary border-primary/30",
  offer: "bg-success/15 text-success border-success/30",
  rejected: "bg-destructive/15 text-destructive border-destructive/30",
  ghosted: "bg-muted text-muted-foreground border-border",
}

function parseJobUrl(rawUrl: string): { company: string; role: string; source: string } {
  let company = "", role = "", source = ""
  try {
    const url = /^https?:\/\//i.test(rawUrl) ? rawUrl : "https://" + rawUrl
    const u = new URL(url)
    const host = u.hostname.replace(/^www\./, "")
    const parts = u.pathname.split("/").filter(Boolean)
    const cap = (s: string) =>
      s.replace(/[-_]/g, " ").replace(/\s+/g, " ").trim().replace(/\b\w/g, (c) => c.toUpperCase())

    if (host.includes("greenhouse")) { source = "Greenhouse"; company = parts[0] || "" }
    else if (host.includes("lever.co")) { source = "Lever"; company = parts[0] || "" }
    else if (host.includes("ashby")) { source = "Ashby"; company = parts[0] || "" }
    else if (host.includes("workable")) { source = "Workable"; company = parts[0] || "" }
    else if (host.includes("myworkdayjobs") || host.includes("workday")) { source = "Workday"; company = host.split(".")[0] }
    else if (host.includes("linkedin")) { source = "LinkedIn" }
    else if (host.includes("indeed")) { source = "Indeed" }
    else if (host.includes("glassdoor")) { source = "Glassdoor" }
    else { source = host; company = host.split(".")[0] }

    const slug = [...parts].reverse().find(
      (p) => /[a-z]/i.test(p) && p.replace(/[-_]/g, "").length > 3 &&
        !/^[0-9a-f]{16,}$/i.test(p) && !/^[0-9-]+$/.test(p)
    )
    if (slug && slug !== company) role = cap(slug).replace(/\d{4,}/g, "").trim()
    company = company ? cap(company) : ""
  } catch {
    // invalid URL, leave fields empty
  }
  return { company, role, source }
}

export function JobsBoard({ jobs }: { jobs: JobRow[] }) {
  const [open, setOpen] = useState(false)
  const [link, setLink] = useState("")
  const [company, setCompany] = useState("")
  const [role, setRole] = useState("")
  const [source, setSource] = useState("")
  const [northStar, setNorthStar] = useState("")
  const [notes, setNotes] = useState("")
  const [autofilled, setAutofilled] = useState(false)
  const [pending, startTransition] = useTransition()

  const count = jobs.length
  const pct = Math.min(Math.round((count / JOB_TARGET) * 100), 100)

  const onLinkChange = (val: string) => {
    setLink(val)
    if (val.length > 10) {
      const parsed = parseJobUrl(val)
      if (parsed.company || parsed.role) {
        setCompany(parsed.company)
        setRole(parsed.role)
        setSource(parsed.source)
        setAutofilled(true)
      } else {
        setAutofilled(false)
      }
    } else {
      setAutofilled(false)
    }
  }

  const reset = () => {
    setLink(""); setCompany(""); setRole(""); setSource("")
    setNorthStar(""); setNotes(""); setAutofilled(false); setOpen(false)
  }

  const submit = () => {
    if (!link.trim()) { toast.error("Paste the job link first"); return }
    const notesWithSource = source && !notes.includes(source) ? `Source: ${source}${notes ? "\n" + notes : ""}` : notes
    startTransition(async () => {
      await addJob({ link, company, role, northStar, notes: notesWithSource })
      reset()
      toast.success("Application logged")
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold">Applications</h2>
            <p className="text-sm text-muted-foreground">
              {count} of {JOB_TARGET} sent
            </p>
          </div>
          <div className="text-2xl font-bold tabular-nums text-primary">{count}</div>
        </div>
        <Progress value={pct} className="mt-3 h-2" />
        <p className="mt-1.5 text-xs text-muted-foreground">{pct}% to your 40-application target</p>
      </Card>

      {!open ? (
        <Button onClick={() => setOpen(true)} className="w-full">
          <Plus className="mr-1.5 h-4 w-4" /> Log an application
        </Button>
      ) : (
        <Card className="p-5">
          <h3 className="mb-4 text-sm font-semibold">New application</h3>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="link" className="text-xs">Job link *</Label>
              <Input
                id="link"
                placeholder="Paste link — company & role fill in automatically"
                value={link}
                onChange={(e) => onLinkChange(e.target.value)}
                autoFocus
              />
              {autofilled && (
                <p className="flex items-center gap-1 text-xs text-primary">
                  <Sparkles className="h-3 w-3" /> Auto-filled from URL — edit below if needed
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="company" className="text-xs">Company</Label>
                <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="role" className="text-xs">Role</Label>
                <Input id="role" value={role} onChange={(e) => setRole(e.target.value)} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ns" className="flex items-center gap-1.5 text-xs">
                <Compass className="h-3.5 w-3.5" /> North Star
              </Label>
              <Input
                id="ns"
                placeholder="Why this role? What does it move you toward?"
                value={northStar}
                onChange={(e) => setNorthStar(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="jnotes" className="text-xs">Notes / strategy</Label>
              <Textarea id="jnotes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button onClick={submit} disabled={pending} className="flex-1">
                {pending ? "Saving..." : "Save application"}
              </Button>
              <Button variant="ghost" onClick={reset}>Cancel</Button>
            </div>
          </div>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {jobs.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-sm text-muted-foreground">No applications yet. Paste your first job link above.</p>
          </Card>
        )}
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  )
}

function JobCard({ job }: { job: JobRow }) {
  const [, startTransition] = useTransition()
  const applied = new Date(job.appliedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold">{job.company || "Untitled company"}</h3>
            <Badge variant="outline" className={statusStyles[job.status] || ""}>
              {job.status}
            </Badge>
          </div>
          {job.role && <p className="text-sm text-muted-foreground">{job.role}</p>}
          <p className="mt-0.5 text-xs text-muted-foreground">Applied {applied}</p>
        </div>
        <a
          href={job.link}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 text-muted-foreground hover:text-primary"
          aria-label="Open job link"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      {job.northStar && (
        <p className="mt-2 rounded-md bg-muted/50 p-2 text-xs leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">North Star: </span>
          {job.northStar}
        </p>
      )}

      <div className="mt-3 flex items-center gap-2">
        <Select
          defaultValue={job.status}
          onValueChange={(v) => startTransition(async () => void (await updateJobStatus(job.id, v)))}
        >
          <SelectTrigger className="h-8 w-36 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="text-xs capitalize">
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={() => startTransition(async () => void (await deleteJob(job.id)))}
          aria-label="Delete application"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  )
}

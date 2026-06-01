"use client"

import { useState, useTransition } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { addProjectTask, toggleProjectTask, deleteProjectTask, type ProjectTaskRow } from "@/app/actions/projects"
import { PROJECTS } from "@/lib/program"
import { cn } from "@/lib/utils"
import { Plus, Trash2 } from "lucide-react"

export function ProjectsBoard({ tasks }: { tasks: ProjectTaskRow[] }) {
  return (
    <div className="flex flex-col gap-4">
      {PROJECTS.map((p) => (
        <ProjectColumn key={p} project={p} tasks={tasks.filter((t) => t.project === p)} />
      ))}
    </div>
  )
}

function ProjectColumn({ project, tasks }: { project: string; tasks: ProjectTaskRow[] }) {
  const [title, setTitle] = useState("")
  const [, startTransition] = useTransition()

  const done = tasks.filter((t) => t.done).length
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0

  const add = () => {
    if (!title.trim()) return
    const t = title
    setTitle("")
    startTransition(async () => void (await addProjectTask({ project, title: t })))
  }

  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold">{project}</h2>
        <span className="text-xs text-muted-foreground tabular-nums">
          {done}/{tasks.length}
        </span>
      </div>
      {tasks.length > 0 && <Progress value={pct} className="mb-3 h-1.5" />}

      <ul className="flex flex-col gap-1.5">
        {tasks.map((t) => (
          <li
            key={t.id}
            className="group flex items-center gap-2.5 rounded-lg border border-border p-2.5"
          >
            <Checkbox
              checked={t.done}
              onCheckedChange={(v) => startTransition(async () => void (await toggleProjectTask(t.id, Boolean(v))))}
            />
            <span className={cn("flex-1 text-sm", t.done && "text-muted-foreground line-through")}>{t.title}</span>
            <button
              onClick={() => startTransition(async () => void (await deleteProjectTask(t.id)))}
              className="text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
              aria-label="Delete task"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
        {tasks.length === 0 && <li className="py-2 text-xs text-muted-foreground">No tasks yet — break it down below.</li>}
      </ul>

      <div className="mt-3 flex gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Add a step..."
          className="h-9"
        />
        <Button size="icon" className="h-9 w-9 shrink-0" onClick={add} aria-label="Add task">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  )
}

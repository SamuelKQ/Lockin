"use client"

import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { seedStarterTasks } from "@/app/actions/seed"
import { toast } from "sonner"
import { Wand2 } from "lucide-react"

export function SeedButton() {
  const [pending, startTransition] = useTransition()
  return (
    <Button
      size="sm"
      variant="outline"
      className="shrink-0 bg-transparent"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await seedStarterTasks()
          toast.success(res.seeded ? "Starter plan added" : "You already have tasks")
        })
      }
    >
      <Wand2 className="mr-1.5 h-3.5 w-3.5" /> {pending ? "Adding..." : "Add starter plan"}
    </Button>
  )
}

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { TopBar, BottomNav } from "@/components/app-nav"
import { ProjectsBoard } from "@/components/projects-board"
import { GoalsOverview } from "@/components/goals-overview"
import { SeedButton } from "@/components/seed-button"
import { getProjectTasks } from "@/app/actions/projects"

export default async function ProjectsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in")

  const tasks = await getProjectTasks()

  return (
    <div className="flex min-h-svh flex-col">
      <TopBar name={session.user.name} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-5">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Goals &amp; Projects</h1>
            <p className="text-sm text-muted-foreground">Break the big goals into steps you can finish.</p>
          </div>
          {tasks.length === 0 && <SeedButton />}
        </div>
        <div className="flex flex-col gap-4">
          <GoalsOverview />
          <ProjectsBoard tasks={tasks} />
        </div>
      </main>
      <BottomNav />
    </div>
  )
}

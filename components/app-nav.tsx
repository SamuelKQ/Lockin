"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { authClient } from "@/lib/auth-client"
import { Home, Briefcase, FolderKanban, LineChart, ClipboardCheck, LogOut, Flame, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

const items = [
  { href: "/", label: "Today", icon: Home },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/progress", label: "Progress", icon: LineChart },
  { href: "/review", label: "Review", icon: ClipboardCheck },
]

export function TopBar({ name }: { name: string }) {
  const router = useRouter()
  const signOut = async () => {
    await authClient.signOut()
    router.push("/sign-in")
    router.refresh()
  }
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Flame className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight">Lock In</span>
        </Link>
        <div className="flex items-center gap-1">
          <span className="mr-1 hidden text-sm text-muted-foreground sm:inline">{name}</span>
          <Button asChild variant="ghost" size="icon" aria-label="Settings">
            <Link href="/settings">
              <Settings className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}

export function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="sticky bottom-0 z-30 border-t border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl items-stretch justify-between px-2">
        {items.map((item) => {
          const active = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-xs transition-colors",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className={cn("h-5 w-5", active && "fill-primary/10")} />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

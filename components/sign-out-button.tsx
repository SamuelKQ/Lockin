"use client"

import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { LogOut } from "lucide-react"

export function SignOutButton() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const signOut = () => {
    startTransition(async () => {
      await authClient.signOut()
      router.push("/sign-in")
      router.refresh()
    })
  }

  return (
    <Button variant="outline" className="bg-transparent" onClick={signOut} disabled={pending}>
      <LogOut className="mr-1.5 h-4 w-4" />
      {pending ? "Signing out..." : "Sign out"}
    </Button>
  )
}

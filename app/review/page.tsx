import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { TopBar, BottomNav } from "@/components/app-nav"
import { ReviewForm } from "@/components/review-form"
import { PastReviews } from "@/components/past-reviews"
import { getReviews, getReview } from "@/app/actions/review"
import { TOTAL_WEEKS, programWeek, todayStr } from "@/lib/program"
import { Card } from "@/components/ui/card"

export default async function ReviewPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in")

  const today = todayStr()
  const curWeek = Math.max(programWeek(today), 1)
  const weeks = Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1)
  const [reviews, currentReview] = await Promise.all([getReviews(), getReview(curWeek)])

  return (
    <div className="flex min-h-svh flex-col">
      <TopBar name={session.user.name} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-5">
        <div className="mb-4">
          <h1 className="text-xl font-bold tracking-tight">Weekly Review</h1>
          <p className="text-sm text-muted-foreground">Every Sunday: reflect, score, and save a PDF report.</p>
        </div>
        <div className="flex flex-col gap-4">
          <Card className="border-primary/30 bg-primary/5 p-4">
            <p className="text-sm leading-relaxed">
              <span className="font-medium">The rhythm:</span> each Sunday, fill this in while the week is fresh. Hit{" "}
              <span className="font-medium text-primary">Export PDF</span> to keep a permanent record of how the week
              went.
            </p>
          </Card>
          <ReviewForm weeks={weeks} currentWeek={curWeek} initialReview={currentReview} />
          <PastReviews reviews={reviews} />
        </div>
      </main>
      <BottomNav />
    </div>
  )
}

"use client"

import { Card } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ReferenceLine } from "recharts"
import { GOAL_WEIGHT, INTERIM_GOAL_WEIGHT } from "@/lib/program"

type Point = { date: string; label: string; weight: number; target: number }

export function WeightChart({ data }: { data: Point[] }) {
  if (data.length === 0) {
    return (
      <Card className="p-5">
        <h2 className="mb-1 text-base font-semibold">Weight trend</h2>
        <p className="py-8 text-center text-sm text-muted-foreground">
          Log your weight on the Today tab to see your trend here.
        </p>
      </Card>
    )
  }

  const weights = data.map((d) => d.weight)
  const min = Math.min(...weights, INTERIM_GOAL_WEIGHT) - 1
  const max = Math.max(...weights) + 1

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold">Weight trend</h2>
        <span className="text-xs text-muted-foreground">Goal {INTERIM_GOAL_WEIGHT}kg in 40d</span>
      </div>
      <ChartContainer
        config={{
          weight: { label: "Weight", color: "var(--chart-1)" },
          target: { label: "Target", color: "var(--chart-5)" },
        }}
        className="h-[240px] w-full"
      >
        <LineChart data={data} margin={{ left: -16, right: 8, top: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} minTickGap={20} />
          <YAxis domain={[Math.floor(min), Math.ceil(max)]} tickLine={false} axisLine={false} fontSize={11} width={40} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ReferenceLine y={INTERIM_GOAL_WEIGHT} stroke="var(--chart-2)" strokeDasharray="4 4" />
          <Line
            type="monotone"
            dataKey="target"
            stroke="var(--color-target)"
            strokeWidth={1.5}
            strokeDasharray="5 5"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="var(--color-weight)"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "var(--color-weight)" }}
          />
        </LineChart>
      </ChartContainer>
      <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
        Dashed amber line is your daily target glide path. Green line marks the 40-day goal. EOY north star:{" "}
        {GOAL_WEIGHT}kg.
      </p>
    </Card>
  )
}

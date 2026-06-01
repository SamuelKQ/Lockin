"use client"

import { Card } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts"

type Bucket = { label: string; value: number }

export function ConsistencyChart({ data, title, suffix }: { data: Bucket[]; title: string; suffix?: string }) {
  return (
    <Card className="p-5">
      <h2 className="mb-4 text-base font-semibold">{title}</h2>
      <ChartContainer
        config={{ value: { label: "Done", color: "var(--chart-1)" } }}
        className="h-[200px] w-full"
      >
        <BarChart data={data} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
          <YAxis tickLine={false} axisLine={false} fontSize={11} width={32} allowDecimals={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="value" fill="var(--color-value)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>
      {suffix && <p className="mt-2 text-xs text-muted-foreground">{suffix}</p>}
    </Card>
  )
}

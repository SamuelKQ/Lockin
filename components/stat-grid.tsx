import { Card } from "@/components/ui/card"

export function StatGrid({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((it) => (
        <Card key={it.label} className="p-4">
          <p className="text-xs text-muted-foreground">{it.label}</p>
          <p className="mt-1 text-xl font-bold tabular-nums">{it.value}</p>
        </Card>
      ))}
    </div>
  )
}

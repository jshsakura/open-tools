"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Users, BarChart } from "lucide-react"
import { cn } from "@/lib/utils"

export function VisitorCounter({ className }: { className?: string }) {
  const t = useTranslations("Common")
  const [stats, setStats] = useState<{ today: number; total: number } | null>(null)

  useEffect(() => {
    const todayKey = new Date().toISOString().split("T")[0]
    const sessionKey = `has_visited_${todayKey}`
    const hasVisited = sessionStorage.getItem(sessionKey)
    const url = hasVisited ? "/api/visitors" : "/api/visitors?hit=true"

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setStats(data)
        if (!hasVisited) sessionStorage.setItem(sessionKey, "true")
      })
      .catch(err => console.error("Visitor count fetch failed:", err))
  }, [])

  if (!stats) return null

  return (
    <div className={cn(
      "mt-4 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 animate-in fade-in duration-1000",
      className,
    )}>
      <div className="flex flex-wrap items-center gap-2">
        <div className="mr-auto flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          <Users className="h-3.5 w-3.5 text-primary/70" />
          {t("visitors") || "Visitors"}
        </div>

        <div className="inline-flex min-w-[88px] items-center justify-between gap-2 rounded-full border border-white/10 bg-background/70 px-3 py-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">{t("today") || "Today"}</span>
          <span className="text-sm font-mono font-bold tabular-nums text-foreground">{stats.today.toLocaleString()}</span>
        </div>

        <div className="inline-flex min-w-[88px] items-center justify-between gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/70">{t("total") || "Total"}</span>
          <span className="text-sm font-mono font-bold tabular-nums text-foreground">{stats.total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}

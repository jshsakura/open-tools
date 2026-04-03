"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Users } from "lucide-react"
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
      "mt-4 inline-flex max-w-full rounded-full border border-white/10 bg-white/5 px-2.5 py-1.5 animate-in fade-in duration-1000",
      className,
    )}>
      <div className="flex w-full flex-nowrap items-center gap-1.5 overflow-hidden">
        <div className="flex shrink-0 items-center gap-1 text-[10px] font-semibold text-muted-foreground">
          <Users className="h-3 w-3 text-primary/70" />
          <span>{t("visitorsShort") || "Visits"}</span>
        </div>

        <div className="inline-flex min-w-0 shrink items-center gap-1 rounded-full border border-white/10 bg-background/70 px-2 py-1">
          <span className="text-[10px] font-medium text-muted-foreground/80">{t("today") || "Today"}</span>
          <span className="text-xs font-mono font-bold tabular-nums text-foreground">{stats.today.toLocaleString()}</span>
        </div>

        <div className="inline-flex min-w-0 shrink items-center gap-1 rounded-full border border-primary/15 bg-primary/5 px-2 py-1">
          <span className="text-[10px] font-medium text-primary/70">{t("total") || "Total"}</span>
          <span className="text-xs font-mono font-bold tabular-nums text-foreground">{stats.total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Users, BarChart } from "lucide-react"
import { cn } from "@/lib/utils"

export function VisitorCounter({ className }: { className?: string }) {
  const t = useTranslations("Common")
  const [stats, setStats] = useState<{ today: number; total: number } | null>(null)

  useEffect(() => {
    // 세션당 한 번만 카운트 올림 (단순화된 세션 체크)
    const hasVisited = sessionStorage.getItem("has_visited_today")
    const url = hasVisited ? "/api/visitors" : "/api/visitors?hit=true"

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setStats(data)
        if (!hasVisited) sessionStorage.setItem("has_visited_today", "true")
      })
      .catch(err => console.error("Visitor count fetch failed:", err))
  }, [])

  if (!stats) return null

  return (
    <div className={cn(
      "mt-4 px-2 py-3 rounded-xl bg-white/5 border border-white/10 space-y-2 animate-in fade-in duration-1000",
      className,
    )}>
      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        <Users className="h-3 w-3 text-primary/70" />
        {t("visitors") || "Visitors"}
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-muted-foreground/60">{t("today") || "Today"}</span>
          <span className="text-sm font-mono font-bold text-foreground">{stats.today.toLocaleString()}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-muted-foreground/60">{t("total") || "Total"}</span>
          <span className="text-sm font-mono font-bold text-foreground">{stats.total.toLocaleString()}</span>
        </div>
      </div>
      
      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-primary/30 w-full animate-pulse" />
      </div>
    </div>
  )
}

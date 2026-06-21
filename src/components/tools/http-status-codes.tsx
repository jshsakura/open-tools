"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Copy } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  filterByClass,
  filterCodes,
  statusClassOf,
  type HttpStatusCode,
  type StatusClass,
} from "./http-status-codes.utils"

const CLASS_FILTERS: StatusClass[] = ["all", 1, 2, 3, 4, 5]

// Per-class color accents (Tailwind classes are static so JIT can pick them up).
const CLASS_STYLES: Record<number, { chip: string; accent: string }> = {
  1: { chip: "data-[active=true]:bg-slate-500", accent: "text-slate-400" },
  2: { chip: "data-[active=true]:bg-green-600", accent: "text-green-500" },
  3: { chip: "data-[active=true]:bg-blue-600", accent: "text-blue-500" },
  4: { chip: "data-[active=true]:bg-amber-600", accent: "text-amber-500" },
  5: { chip: "data-[active=true]:bg-red-600", accent: "text-red-500" },
}

const accentFor = (code: number) => CLASS_STYLES[statusClassOf(code)]?.accent ?? "text-primary"

export function HttpStatusCodes() {
  const t = useTranslations("HttpStatusCodes.ui")
  const [search, setSearch] = useState("")
  const [activeClass, setActiveClass] = useState<StatusClass>("all")

  const filtered = filterByClass(activeClass, filterCodes(search))

  // Group results by class, preserving ascending code order.
  const groups = new Map<number, HttpStatusCode[]>()
  for (const item of filtered) {
    const cls = statusClassOf(item.code)
    const bucket = groups.get(cls) ?? []
    groups.set(cls, [...bucket, item])
  }
  const orderedGroups = [...groups.entries()].sort(([a], [b]) => a - b)

  const labelForClass = (c: StatusClass) =>
    c === "all" ? t("filterAll") : `${c}xx`

  const copyCode = (item: HttpStatusCode) => {
    navigator.clipboard.writeText(`${item.code} ${item.name}`)
    toast.success(t("copied"))
  }

  return (
    <Card className="max-w-4xl mx-auto border-border/50 bg-card/30 backdrop-blur-md">
      <CardContent className="pt-6 space-y-4">
        <Input
          placeholder={t("searchCode")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-background/50"
        />

        <div className="flex flex-wrap gap-2">
          {CLASS_FILTERS.map((c) => (
            <Button
              key={String(c)}
              size="sm"
              variant={activeClass === c ? "default" : "outline"}
              data-active={activeClass === c}
              onClick={() => setActiveClass(c)}
              className={`h-8 font-mono text-xs ${typeof c === "number" ? CLASS_STYLES[c].chip : ""}`}
            >
              {labelForClass(c)}
            </Button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">{t("noResults")}</p>
        ) : (
          orderedGroups.map(([cls, items]) => (
            <div key={cls} className="space-y-3">
              <h4 className={`text-xs font-bold ${CLASS_STYLES[cls]?.accent ?? "text-muted-foreground"}`}>
                {cls}xx
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {items.map((item) => (
                  <Card key={item.code} className="bg-muted/40">
                    <CardContent className="py-4 space-y-1">
                      <div className="flex justify-between items-start">
                        <span className={`text-sm font-bold font-mono ${accentFor(item.code)}`}>
                          {item.code}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-muted-foreground">{item.name}</span>
                          <button
                            type="button"
                            onClick={() => copyCode(item)}
                            aria-label={t("copyCode")}
                            className="text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs leading-relaxed text-muted-foreground pt-1">{item.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

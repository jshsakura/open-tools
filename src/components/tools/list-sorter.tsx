"use client"

import { useState, useMemo } from "react"
import { useTranslations } from "next-intl"
import { 
  ListFilter, 
  SortAsc, 
  SortDesc, 
  Copy, 
  Trash2, 
  Check, 
  Eraser, 
  Hash, 
  Layers,
  Zap,
  ArrowDownUp
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { GlassCard } from "@/components/ui/glass-card"
import { cn } from "@/lib/utils"

export function ListSorter() {
  const t = useTranslations("ListSorter")
  const [text, setText] = useState("")
  const [copied, setCopied] = useState(false)

  const stats = useMemo(() => {
    const lines = text.split("\n")
    const originalCount = text.trim() === "" ? 0 : lines.length
    
    const uniqueLines = Array.from(new Set(lines))
    const duplicatesRemoved = originalCount - (text.trim() === "" ? 0 : uniqueLines.length)

    return {
      original: originalCount,
      current: originalCount,
      duplicates: duplicatesRemoved >= 0 ? duplicatesRemoved : 0
    }
  }, [text])

  const handleSort = (desc = false) => {
    const lines = text.split("\n").filter(line => line.length > 0)
    lines.sort((a, b) => {
      return desc ? b.localeCompare(a) : a.localeCompare(b)
    })
    setText(lines.join("\n"))
  }

  const handleRemoveDuplicates = () => {
    const lines = text.split("\n")
    const uniqueLines = Array.from(new Set(lines))
    setText(uniqueLines.join("\n"))
  }

  const handleTrim = () => {
    const lines = text.split("\n").map(line => line.trim())
    setText(lines.join("\n"))
  }

  const handleRemoveEmpty = () => {
    const lines = text.split("\n").filter(line => line.trim().length > 0)
    setText(lines.join("\n"))
  }

  const handleReverse = () => {
    const lines = text.split("\n")
    setText(lines.reverse().join("\n"))
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const statCards = [
    {
      label: t("stats.original"),
      value: stats.original.toLocaleString(),
      icon: Hash,
      iconColor: "text-blue-500",
    },
    {
      label: t("stats.duplicates"),
      value: stats.duplicates.toLocaleString(),
      icon: Layers,
      iconColor: "text-amber-500",
    },
    {
      label: t("stats.current"),
      value: stats.current.toLocaleString(),
      icon: Zap,
      iconColor: "text-emerald-500",
    },
  ]

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-4 px-1">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <ListFilter className="w-4 h-4 text-sky-500" />
            {t("input")}
          </Label>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              disabled={!text}
              className="h-8 px-3 text-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
              {copied ? "Copied" : t("copy")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setText("")}
              disabled={!text}
              className="h-8 px-3 text-xs text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              {t("clear")}
            </Button>
          </div>
        </div>

        <Textarea
          placeholder={t("placeholder")}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[300px] font-mono text-sm bg-background/50 focus:bg-background transition-all resize-y leading-relaxed"
          autoFocus
        />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mt-4">
          <Button variant="secondary" size="sm" onClick={() => handleSort(false)} disabled={!text} className="text-xs">
            <SortAsc className="w-3.5 h-3.5 mr-1" />
            {t("sortAsc")}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => handleSort(true)} disabled={!text} className="text-xs">
            <SortDesc className="w-3.5 h-3.5 mr-1" />
            {t("sortDesc")}
          </Button>
          <Button variant="secondary" size="sm" onClick={handleRemoveDuplicates} disabled={!text} className="text-xs">
            <Layers className="w-3.5 h-3.5 mr-1" />
            {t("removeDuplicates")}
          </Button>
          <Button variant="secondary" size="sm" onClick={handleTrim} disabled={!text} className="text-xs">
            <Eraser className="w-3.5 h-3.5 mr-1" />
            {t("trimLines")}
          </Button>
          <Button variant="secondary" size="sm" onClick={handleRemoveEmpty} disabled={!text} className="text-xs">
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            {t("removeEmpty")}
          </Button>
          <Button variant="secondary" size="sm" onClick={handleReverse} disabled={!text} className="text-xs">
            <ArrowDownUp className="w-3.5 h-3.5 mr-1" />
            {t("reverse")}
          </Button>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {statCards.map((stat, i) => {
          const Icon = stat.icon
          return (
            <GlassCard
              key={i}
              className={cn(
                "p-4 flex flex-col gap-2 transition-all duration-200",
                text ? "opacity-100" : "opacity-60",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  {stat.label}
                </span>
                <Icon className={cn("w-4 h-4", stat.iconColor)} />
              </div>
              <p className="text-2xl font-bold tracking-tight tabular-nums">
                {stat.value}
              </p>
            </GlassCard>
          )
        })}
      </div>
    </div>
  )
}

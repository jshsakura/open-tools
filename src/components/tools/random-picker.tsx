"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Dices, ListChecks, RefreshCw, Sparkles } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

function shuffle<T>(items: T[]) {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function RandomPickerTool() {
  const t = useTranslations("RandomPicker")
  const [input, setInput] = useState("Pizza\nSushi\nBurgers\nTacos")
  const [pickCount, setPickCount] = useState("1")
  const [results, setResults] = useState<Array<{ id: string; value: string }>>([])

  const items = useMemo(
    () => input.split("\n").map((line) => line.trim()).filter(Boolean),
    [input],
  )

  const draw = () => {
    const count = Math.max(1, Math.min(items.length, parseInt(pickCount, 10) || 1))
    setResults(shuffle(items).slice(0, count).map((value) => ({ id: crypto.randomUUID(), value })))
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <GlassCard className="p-6 space-y-5">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <ListChecks className="h-4 w-4 text-sky-500" />
              {t("items")}
            </Label>
            <Textarea value={input} onChange={(e) => setInput(e.target.value)} className="min-h-[240px]" placeholder={t("placeholder")} />
          </div>

          <div className="space-y-2">
            <Label>{t("pickCount")}</Label>
            <Input type="number" min="1" max={Math.max(1, items.length)} value={pickCount} onChange={(e) => setPickCount(e.target.value)} />
          </div>

          <Button onClick={draw} disabled={items.length === 0} className="w-full">
            <Dices className="mr-2 h-4 w-4" />
            {t("pickNow")}
          </Button>
        </GlassCard>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <GlassCard className="p-5 border-sky-500/20">
              <p className="text-sm text-muted-foreground">{t("totalItems")}</p>
              <p className="mt-2 text-3xl font-black text-sky-500">{items.length}</p>
            </GlassCard>
            <GlassCard className="p-5 border-violet-500/20">
              <p className="text-sm text-muted-foreground">{t("selectedCount")}</p>
              <p className="mt-2 text-3xl font-black text-violet-500">{results.length}</p>
            </GlassCard>
          </div>

          <GlassCard className="p-6 border-emerald-500/20">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-500" />
                <h3 className="font-semibold">{t("results")}</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={draw} disabled={items.length === 0}>
                <RefreshCw className="mr-2 h-4 w-4" />
                {t("reroll")}
              </Button>
            </div>

            {results.length > 0 ? (
              <div className="space-y-3">
                {results.map((item, index) => (
                  <div key={item.id} className="rounded-2xl border border-border/50 bg-muted/20 px-4 py-3 font-medium">
                    <span className="mr-3 text-sm text-muted-foreground">#{index + 1}</span>
                    {item.value}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border/60 bg-muted/15 px-4 py-10 text-center text-sm text-muted-foreground">
                {t("emptyState")}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  )
}

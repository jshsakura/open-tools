"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Copy, Trophy } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { GlassCard } from "@/components/ui/glass-card"
import {
  calculateAll,
  formatSpecificity,
} from "./css-specificity-calculator.utils"

const DEFAULT_INPUT = `#header .nav a:hover
.nav a
ul li a
:where(.theme) .nav a
nav a::before`

export function CssSpecificityCalculator() {
  const t = useTranslations("CssSpecificityCalculator")
  const [input, setInput] = useState(DEFAULT_INPUT)

  const { results, winners } = useMemo(() => calculateAll(input), [input])
  const winnerSet = useMemo(() => new Set(winners), [winners])
  const hasUniqueWinner = winners.length === 1

  const copy = (text: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    toast.success(t("copied"))
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <GlassCard className="space-y-4 p-6">
        <div className="space-y-2">
          <Label htmlFor="selectors">{t("inputLabel")}</Label>
          <Textarea
            id="selectors"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className="min-h-40 font-mono text-sm"
            placeholder={t("inputPlaceholder")}
            spellCheck={false}
          />
          <p className="text-xs text-muted-foreground">{t("inputHint")}</p>
        </div>
      </GlassCard>

      <GlassCard className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">{t("resultsTitle")}</p>
          <span className="font-mono text-xs text-muted-foreground">
            (a, b, c)
          </span>
        </div>

        {results.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("emptyState")}</p>
        ) : (
          <ul className="space-y-3">
            {results.map((item, index) => {
              const isWinner = winnerSet.has(index)
              const tuple = formatSpecificity(item.specificity)
              return (
                <li
                  key={`${item.selector}-${index}`}
                  className={`rounded-xl border p-4 transition-colors ${
                    isWinner
                      ? "border-primary/40 bg-primary/10"
                      : "border-border/50 bg-muted/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        {isWinner && hasUniqueWinner && (
                          <Trophy
                            className="h-4 w-4 shrink-0 text-primary"
                            aria-label={t("winnerLabel")}
                          />
                        )}
                        <code className="break-all font-mono text-sm">
                          {item.selector}
                        </code>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="rounded-md bg-rose-500/15 px-2 py-0.5 font-mono text-rose-600 dark:text-rose-400">
                          {t("idCount", { count: item.specificity.a })}
                        </span>
                        <span className="rounded-md bg-amber-500/15 px-2 py-0.5 font-mono text-amber-600 dark:text-amber-400">
                          {t("classCount", { count: item.specificity.b })}
                        </span>
                        <span className="rounded-md bg-sky-500/15 px-2 py-0.5 font-mono text-sky-600 dark:text-sky-400">
                          {t("elementCount", { count: item.specificity.c })}
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="font-mono text-lg font-black tracking-wider">
                        {tuple}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => copy(tuple)}
                        aria-label={t("copy")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        {results.length > 1 && winners.length > 0 && (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
            <p className="flex items-center gap-2 text-sm font-medium text-primary">
              <Trophy className="h-4 w-4" />
              {hasUniqueWinner
                ? t("winnerSummary", {
                    selector: results[winners[0]].selector,
                  })
                : t("tieSummary", { count: winners.length })}
            </p>
          </div>
        )}
      </GlassCard>

      <GlassCard className="space-y-3 p-6">
        <p className="text-sm font-medium">{t("legendTitle")}</p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>
            <span className="font-mono font-semibold text-rose-600 dark:text-rose-400">
              a
            </span>{" "}
            {t("legendA")}
          </li>
          <li>
            <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">
              b
            </span>{" "}
            {t("legendB")}
          </li>
          <li>
            <span className="font-mono font-semibold text-sky-600 dark:text-sky-400">
              c
            </span>{" "}
            {t("legendC")}
          </li>
        </ul>
        <p className="text-xs text-muted-foreground">{t("inlineNote")}</p>
      </GlassCard>
    </div>
  )
}

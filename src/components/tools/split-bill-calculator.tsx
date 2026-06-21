"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Calculator, Plus, ReceiptText, Trash2, Users, Wallet } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { computeSplit, type SplitMode, type SplitPersonInput } from "./split-bill-calculator.utils"

const CURRENCY_OPTIONS = ["USD", "EUR", "GBP", "JPY", "KRW"] as const
type Currency = (typeof CURRENCY_OPTIONS)[number]

function makeFormatter(currency: Currency) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "JPY" || currency === "KRW" ? 0 : 2,
  })
}

interface PersonRow {
  id: number
  name: string
  weight: string
}

const INITIAL_ROWS: PersonRow[] = [
  { id: 1, name: "", weight: "1" },
  { id: 2, name: "", weight: "1" },
  { id: 3, name: "", weight: "1" },
]

export function SplitBillCalculatorTool() {
  const t = useTranslations("SplitBillCalculator")
  const [billAmount, setBillAmount] = useState("84")
  const [taxPercent, setTaxPercent] = useState("10")
  const [tipPercent, setTipPercent] = useState("12")
  const [mode, setMode] = useState<SplitMode>("even")
  const [currency, setCurrency] = useState<Currency>("USD")
  const [rows, setRows] = useState<PersonRow[]>(INITIAL_ROWS)

  const formatter = useMemo(() => makeFormatter(currency), [currency])
  const formatMoney = (value: number) => formatter.format(Number.isFinite(value) ? value : 0)

  const result = useMemo(() => {
    const people: SplitPersonInput[] = rows.map((row, index) => ({
      name: row.name.trim() || t("personLabel", { index: index + 1 }),
      weight: parseFloat(row.weight) || 0,
    }))

    return computeSplit({
      bill: parseFloat(billAmount),
      tax: parseFloat(taxPercent),
      tip: parseFloat(tipPercent),
      mode,
      people,
    })
  }, [billAmount, taxPercent, tipPercent, mode, rows, t])

  const addPerson = () => {
    setRows((prev) => [...prev, { id: (prev[prev.length - 1]?.id ?? 0) + 1, name: "", weight: "1" }])
  }

  const removePerson = (id: number) => {
    setRows((prev) => (prev.length <= 1 ? prev : prev.filter((row) => row.id !== id)))
  }

  const updateRow = (id: number, field: "name" | "weight", value: string) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)))
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <GlassCard className="space-y-5 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Wallet className="h-4 w-4 text-emerald-500" />
                {t("billAmount")}
              </Label>
              <Input type="number" min="0" step="0.01" value={billAmount} onChange={(e) => setBillAmount(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">{t("taxPercent")}</Label>
              <Input type="number" min="0" step="0.1" value={taxPercent} onChange={(e) => setTaxPercent(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">{t("tipPercent")}</Label>
              <Input type="number" min="0" step="0.1" value={tipPercent} onChange={(e) => setTipPercent(e.target.value)} />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label className="text-sm font-medium">{t("currency")}</Label>
              <div className="flex flex-wrap gap-2">
                {CURRENCY_OPTIONS.map((code) => (
                  <Button
                    key={code}
                    variant={currency === code ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrency(code)}
                  >
                    {code}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Users className="h-4 w-4 text-sky-500" />
              {t("splitMode")}
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {(["even", "weighted"] as const).map((m) => (
                <Button key={m} variant={mode === m ? "default" : "outline"} onClick={() => setMode(m)} className="text-sm">
                  {t(`mode.${m}`)}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{mode === "weighted" ? t("weightedHint") : t("evenHint")}</p>
          </div>

          <div className="space-y-3">
            {rows.map((row, index) => (
              <div key={row.id} className="flex items-center gap-2">
                <Input
                  className="flex-1"
                  value={row.name}
                  placeholder={t("personLabel", { index: index + 1 })}
                  onChange={(e) => updateRow(row.id, "name", e.target.value)}
                />
                {mode === "weighted" && (
                  <Input
                    className="w-24"
                    type="number"
                    min="0"
                    step="0.5"
                    value={row.weight}
                    aria-label={t("weight")}
                    onChange={(e) => updateRow(row.id, "weight", e.target.value)}
                  />
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removePerson(row.id)}
                  disabled={rows.length <= 1}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label={t("removePerson")}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" onClick={addPerson} className="w-full">
              <Plus className="h-4 w-4" />
              {t("addPerson")}
            </Button>
          </div>

          <div className="rounded-2xl border border-border/50 bg-muted/20 p-4 text-sm text-muted-foreground">
            {t("hint")}
          </div>
        </GlassCard>

        <div className="grid gap-4 sm:grid-cols-2">
          <GlassCard className="border-amber-500/20 p-5">
            <p className="text-sm text-muted-foreground">{t("taxAmount")}</p>
            <p className="mt-2 text-2xl font-black tracking-tight text-amber-500">{result ? formatMoney(result.taxAmount) : "-"}</p>
          </GlassCard>

          <GlassCard className="border-rose-500/20 p-5">
            <p className="text-sm text-muted-foreground">{t("tipAmount")}</p>
            <p className="mt-2 text-2xl font-black tracking-tight text-rose-500">{result ? formatMoney(result.tipAmount) : "-"}</p>
          </GlassCard>

          <GlassCard className="border-violet-500/20 p-5">
            <p className="text-sm text-muted-foreground">{t("total")}</p>
            <p className="mt-2 text-2xl font-black tracking-tight text-violet-500">{result ? formatMoney(result.total) : "-"}</p>
          </GlassCard>

          <GlassCard className="border-sky-500/20 p-5">
            <p className="text-sm text-muted-foreground">{t("perPerson")}</p>
            <p className="mt-2 text-2xl font-black tracking-tight text-sky-500">{result ? formatMoney(result.perPerson) : "-"}</p>
          </GlassCard>

          <GlassCard className="border-emerald-500/20 p-5 sm:col-span-2">
            <div className="flex items-center gap-2">
              <ReceiptText className="h-4 w-4 text-emerald-500" />
              <p className="text-sm font-medium">{t("breakdownTitle")}</p>
            </div>
            <ul className="mt-3 space-y-2">
              {result ? (
                result.shares.map((share, index) => (
                  <li key={index} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{share.name}</span>
                    <span className="font-semibold">{formatMoney(share.amount)}</span>
                  </li>
                ))
              ) : (
                <li className="text-sm text-muted-foreground">{t("invalidInput")}</li>
              )}
            </ul>
          </GlassCard>

          <GlassCard className="border-primary/20 p-5 sm:col-span-2">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-primary/10 p-3">
                <Calculator className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("summaryTitle")}</p>
                <p className="mt-2 text-sm font-medium leading-6">
                  {result
                    ? t("summary", {
                        people: result.shares.length,
                        total: formatMoney(result.total),
                      })
                    : t("invalidInput")}
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}

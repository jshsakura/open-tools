"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Calculator, Coins, ReceiptText, Users } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

export function TipCalculatorTool() {
  const t = useTranslations("TipCalculator")
  const [bill, setBill] = useState("58")
  const [tipPercent, setTipPercent] = useState(15)
  const [people, setPeople] = useState("2")

  const result = useMemo(() => {
    const billValue = parseFloat(bill) || 0
    const peopleValue = Math.max(1, parseInt(people, 10) || 1)
    const tipAmount = billValue * (tipPercent / 100)
    const total = billValue + tipAmount

    return {
      billValue,
      tipAmount,
      total,
      perPerson: total / peopleValue,
      peopleValue,
    }
  }, [bill, people, tipPercent])

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(
      Number.isFinite(value) ? value : 0,
    )

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <GlassCard className="p-6 space-y-6">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <ReceiptText className="h-4 w-4 text-emerald-500" />
              {t("billAmount")}
            </Label>
            <Input type="number" min="0" step="0.01" value={bill} onChange={(e) => setBill(e.target.value)} />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Coins className="h-4 w-4 text-amber-500" />
                {t("tipPercent")}
              </Label>
              <span className="text-sm font-semibold text-amber-500">{tipPercent}%</span>
            </div>
            <Slider value={[tipPercent]} min={0} max={35} step={1} onValueChange={(v) => setTipPercent(v[0] ?? 0)} />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Users className="h-4 w-4 text-sky-500" />
              {t("splitBetween")}
            </Label>
            <Input type="number" min="1" step="1" value={people} onChange={(e) => setPeople(e.target.value)} />
          </div>
        </GlassCard>

        <div className="grid gap-4 sm:grid-cols-2">
          <GlassCard className="p-5 border-emerald-500/20">
            <p className="text-sm text-muted-foreground">{t("tipAmount")}</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-emerald-500">{formatCurrency(result.tipAmount)}</p>
          </GlassCard>
          <GlassCard className="p-5 border-violet-500/20">
            <p className="text-sm text-muted-foreground">{t("totalWithTip")}</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-violet-500">{formatCurrency(result.total)}</p>
          </GlassCard>
          <GlassCard className="p-5 border-sky-500/20 sm:col-span-2">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-sky-500/10 p-3">
                <Calculator className="h-5 w-5 text-sky-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("perPerson")}</p>
                <p className="mt-2 text-3xl font-black tracking-tight text-sky-500">{formatCurrency(result.perPerson)}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t("splitSummary", { people: result.peopleValue, tip: tipPercent })}
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Calculator, ReceiptText, Users, Wallet } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function formatNumber(value: number) {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0)
}

export function SplitBillCalculatorTool() {
  const t = useTranslations("SplitBillCalculator")
  const [billAmount, setBillAmount] = useState("84")
  const [people, setPeople] = useState("3")
  const [taxPercent, setTaxPercent] = useState("10")
  const [tipPercent, setTipPercent] = useState("12")

  const result = useMemo(() => {
    const bill = parseFloat(billAmount)
    const peopleCount = Math.max(1, parseInt(people, 10) || 1)
    const tax = parseFloat(taxPercent) || 0
    const tip = parseFloat(tipPercent) || 0

    if (!Number.isFinite(bill) || bill < 0) {
      return null
    }

    const taxAmount = bill * (tax / 100)
    const tipAmount = bill * (tip / 100)
    const total = bill + taxAmount + tipAmount
    const perPerson = total / peopleCount

    return {
      peopleCount,
      taxAmount,
      tipAmount,
      total,
      perPerson,
    }
  }, [billAmount, people, taxPercent, tipPercent])

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
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Users className="h-4 w-4 text-sky-500" />
                {t("people")}
              </Label>
              <Input type="number" min="1" step="1" value={people} onChange={(e) => setPeople(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">{t("taxPercent")}</Label>
              <Input type="number" min="0" step="0.1" value={taxPercent} onChange={(e) => setTaxPercent(e.target.value)} />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label className="text-sm font-medium">{t("tipPercent")}</Label>
              <Input type="number" min="0" step="0.1" value={tipPercent} onChange={(e) => setTipPercent(e.target.value)} />
            </div>
          </div>

          <div className="rounded-2xl border border-border/50 bg-muted/20 p-4 text-sm text-muted-foreground">
            {t("hint")}
          </div>
        </GlassCard>

        <div className="grid gap-4 sm:grid-cols-2">
          <GlassCard className="border-amber-500/20 p-5">
            <p className="text-sm text-muted-foreground">{t("taxAmount")}</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-amber-500">{result ? formatNumber(result.taxAmount) : "-"}</p>
          </GlassCard>

          <GlassCard className="border-rose-500/20 p-5">
            <p className="text-sm text-muted-foreground">{t("tipAmount")}</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-rose-500">{result ? formatNumber(result.tipAmount) : "-"}</p>
          </GlassCard>

          <GlassCard className="border-violet-500/20 p-5">
            <p className="text-sm text-muted-foreground">{t("total")}</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-violet-500">{result ? formatNumber(result.total) : "-"}</p>
          </GlassCard>

          <GlassCard className="border-sky-500/20 p-5">
            <p className="text-sm text-muted-foreground">{t("perPerson")}</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-sky-500">{result ? formatNumber(result.perPerson) : "-"}</p>
          </GlassCard>

          <GlassCard className="border-emerald-500/20 p-5 sm:col-span-2">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-emerald-500/10 p-3">
                <Calculator className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("summaryTitle")}</p>
                <p className="mt-2 text-sm font-medium leading-6">
                  {result
                    ? t("summary", {
                        people: result.peopleCount,
                        total: formatNumber(result.total),
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

"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Calculator, Coins, Landmark, TrendingUp } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const compoundingsPerYear = {
  yearly: 1,
  quarterly: 4,
  monthly: 12,
} as const

export function CompoundInterestCalculatorTool() {
  const t = useTranslations("CompoundInterestCalculator")
  const [startingAmount, setStartingAmount] = useState("10000")
  const [monthlyContribution, setMonthlyContribution] = useState("300")
  const [annualRate, setAnnualRate] = useState("5")
  const [years, setYears] = useState("10")
  const [compoundFrequency, setCompoundFrequency] = useState<keyof typeof compoundingsPerYear>("monthly")

  const result = useMemo(() => {
    const principal = Number.parseFloat(startingAmount)
    const monthly = Number.parseFloat(monthlyContribution)
    const rate = Number.parseFloat(annualRate)
    const yearsValue = Number.parseFloat(years)

    if (
      !Number.isFinite(principal) ||
      !Number.isFinite(monthly) ||
      !Number.isFinite(rate) ||
      !Number.isFinite(yearsValue) ||
      principal < 0 ||
      monthly < 0 ||
      rate < 0 ||
      yearsValue <= 0
    ) {
      return null
    }

    const periodsPerYear = compoundingsPerYear[compoundFrequency]
    const totalPeriods = yearsValue * periodsPerYear
    const periodicRate = rate / 100 / periodsPerYear
    const monthlyRate = rate / 100 / 12
    const futurePrincipal = principal * Math.pow(1 + periodicRate, totalPeriods)

    const futureContributions = monthlyRate === 0
      ? monthly * 12 * yearsValue
      : monthly * ((Math.pow(1 + monthlyRate, yearsValue * 12) - 1) / monthlyRate)

    const futureValue = futurePrincipal + futureContributions
    const totalContributions = principal + monthly * 12 * yearsValue
    const growth = futureValue - totalContributions

    return {
      futureValue,
      totalContributions,
      growth,
    }
  }, [annualRate, compoundFrequency, monthlyContribution, startingAmount, years])

  const formatCurrency = (value: number) => Math.round(value).toLocaleString()

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <GlassCard className="space-y-5 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("startingAmount")}</Label>
              <Input type="number" min="0" step="1" value={startingAmount} onChange={(e) => setStartingAmount(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("monthlyContribution")}</Label>
              <Input type="number" min="0" step="1" value={monthlyContribution} onChange={(e) => setMonthlyContribution(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("annualRate")}</Label>
              <Input type="number" min="0" step="0.1" value={annualRate} onChange={(e) => setAnnualRate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("years")}</Label>
              <Input type="number" min="1" step="1" value={years} onChange={(e) => setYears(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("compoundFrequency")}</Label>
            <Select value={compoundFrequency} onValueChange={(value: keyof typeof compoundingsPerYear) => setCompoundFrequency(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yearly">{t("frequency.yearly")}</SelectItem>
                <SelectItem value="quarterly">{t("frequency.quarterly")}</SelectItem>
                <SelectItem value="monthly">{t("frequency.monthly")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-2xl border border-border/50 bg-muted/20 p-4 text-sm text-muted-foreground">
            {t("hint")}
          </div>
        </GlassCard>

        <div className="grid gap-4 sm:grid-cols-2">
          <GlassCard className="border-emerald-500/20 p-5 sm:col-span-2">
            <p className="text-sm text-muted-foreground">{t("futureValue")}</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-emerald-500">
              {result ? formatCurrency(result.futureValue) : "-"}
            </p>
          </GlassCard>

          <GlassCard className="border-sky-500/20 p-5">
            <div className="flex items-start gap-3">
              <Landmark className="mt-1 h-5 w-5 text-sky-500" />
              <div>
                <p className="text-sm text-muted-foreground">{t("totalContributions")}</p>
                <p className="mt-2 text-2xl font-black tracking-tight text-sky-500">
                  {result ? formatCurrency(result.totalContributions) : "-"}
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="border-violet-500/20 p-5">
            <div className="flex items-start gap-3">
              <TrendingUp className="mt-1 h-5 w-5 text-violet-500" />
              <div>
                <p className="text-sm text-muted-foreground">{t("investmentGrowth")}</p>
                <p className="mt-2 text-2xl font-black tracking-tight text-violet-500">
                  {result ? formatCurrency(result.growth) : "-"}
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="border-amber-500/20 p-5 sm:col-span-2">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-amber-500/10 p-3">
                <Coins className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("summaryTitle")}</p>
                <p className="mt-2 text-sm font-medium leading-6">
                  {result
                    ? t("summary", {
                        futureValue: formatCurrency(result.futureValue),
                        growth: formatCurrency(result.growth),
                        contributions: formatCurrency(result.totalContributions),
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

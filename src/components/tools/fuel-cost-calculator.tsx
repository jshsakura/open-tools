"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { CarFront, Coins, Fuel, Users } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function FuelCostCalculatorTool() {
  const t = useTranslations("FuelCostCalculator")
  const [distanceKm, setDistanceKm] = useState("120")
  const [efficiency, setEfficiency] = useState("14")
  const [fuelPrice, setFuelPrice] = useState("1700")
  const [passengers, setPassengers] = useState("1")

  const result = useMemo(() => {
    const distance = Number.parseFloat(distanceKm)
    const kmPerLiter = Number.parseFloat(efficiency)
    const pricePerLiter = Number.parseFloat(fuelPrice)
    const people = Number.parseInt(passengers, 10)

    if (!Number.isFinite(distance) || !Number.isFinite(kmPerLiter) || !Number.isFinite(pricePerLiter) || distance <= 0 || kmPerLiter <= 0 || pricePerLiter <= 0) {
      return null
    }

    const fuelNeeded = distance / kmPerLiter
    const totalCost = fuelNeeded * pricePerLiter
    const costPerPerson = Number.isFinite(people) && people > 0 ? totalCost / people : totalCost

    return { distance, fuelNeeded, totalCost, costPerPerson }
  }, [distanceKm, efficiency, fuelPrice, passengers])

  const formatNumber = (value: number, digits = 1) => value.toLocaleString(undefined, { maximumFractionDigits: digits })

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <GlassCard className="space-y-5 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label>{t("distanceKm")}</Label><Input type="number" min="0" step="0.1" value={distanceKm} onChange={(e) => setDistanceKm(e.target.value)} /></div>
            <div className="space-y-2"><Label>{t("efficiency")}</Label><Input type="number" min="0" step="0.1" value={efficiency} onChange={(e) => setEfficiency(e.target.value)} /></div>
            <div className="space-y-2"><Label>{t("fuelPrice")}</Label><Input type="number" min="0" step="1" value={fuelPrice} onChange={(e) => setFuelPrice(e.target.value)} /></div>
            <div className="space-y-2"><Label>{t("passengers")}</Label><Input type="number" min="1" step="1" value={passengers} onChange={(e) => setPassengers(e.target.value)} /></div>
          </div>
          <div className="rounded-2xl border border-border/50 bg-muted/20 p-4 text-sm text-muted-foreground">{t("hint")}</div>
        </GlassCard>

        <div className="grid gap-4 sm:grid-cols-2">
          <GlassCard className="border-sky-500/20 p-5">
            <div className="flex items-start gap-3"><Fuel className="mt-1 h-5 w-5 text-sky-500" /><div><p className="text-sm text-muted-foreground">{t("fuelNeeded")}</p><p className="mt-2 text-2xl font-black tracking-tight text-sky-500">{result ? `${formatNumber(result.fuelNeeded)} L` : "-"}</p></div></div>
          </GlassCard>
          <GlassCard className="border-emerald-500/20 p-5">
            <div className="flex items-start gap-3"><Coins className="mt-1 h-5 w-5 text-emerald-500" /><div><p className="text-sm text-muted-foreground">{t("totalCost")}</p><p className="mt-2 text-2xl font-black tracking-tight text-emerald-500">{result ? formatNumber(result.totalCost, 0) : "-"}</p></div></div>
          </GlassCard>
          <GlassCard className="border-violet-500/20 p-5">
            <div className="flex items-start gap-3"><Users className="mt-1 h-5 w-5 text-violet-500" /><div><p className="text-sm text-muted-foreground">{t("costPerPerson")}</p><p className="mt-2 text-2xl font-black tracking-tight text-violet-500">{result ? formatNumber(result.costPerPerson, 0) : "-"}</p></div></div>
          </GlassCard>
          <GlassCard className="border-amber-500/20 p-5 sm:col-span-2">
            <div className="flex items-start gap-4"><div className="rounded-2xl bg-amber-500/10 p-3"><CarFront className="h-5 w-5 text-amber-500" /></div><div><p className="text-sm text-muted-foreground">{t("summaryTitle")}</p><p className="mt-2 text-sm font-medium leading-6">{result ? t("summary", { distance: formatNumber(result.distance, 0), fuel: formatNumber(result.fuelNeeded), cost: formatNumber(result.totalCost, 0) }) : t("invalidInput")}</p></div></div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { CarFront, Coins, Fuel, Repeat, Scale, Users } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { computeFuelCost, type EfficiencyUnit } from "./fuel-cost-calculator.utils"

const EFFICIENCY_UNITS: EfficiencyUnit[] = ["kmPerL", "lPer100km", "mpg"]

function formatNumber(value: number, digits = 1) {
  return value.toLocaleString(undefined, { maximumFractionDigits: digits })
}

export function FuelCostCalculatorTool() {
  const t = useTranslations("FuelCostCalculator")
  const [distanceKm, setDistanceKm] = useState("120")
  const [efficiency, setEfficiency] = useState("14")
  const [efficiencyUnit, setEfficiencyUnit] = useState<EfficiencyUnit>("kmPerL")
  const [fuelPrice, setFuelPrice] = useState("1700")
  const [passengers, setPassengers] = useState("1")
  const [roundTrip, setRoundTrip] = useState(false)
  const [compareEnabled, setCompareEnabled] = useState(false)
  const [efficiencyB, setEfficiencyB] = useState("9")

  const sharedInput = useMemo(
    () => ({
      distanceKm: Number.parseFloat(distanceKm),
      efficiencyUnit,
      pricePerLiter: Number.parseFloat(fuelPrice),
      roundTrip,
      passengers: Number.parseInt(passengers, 10),
    }),
    [distanceKm, efficiencyUnit, fuelPrice, roundTrip, passengers],
  )

  const result = useMemo(
    () => computeFuelCost({ ...sharedInput, efficiency: Number.parseFloat(efficiency) }),
    [sharedInput, efficiency],
  )

  const resultB = useMemo(
    () => (compareEnabled ? computeFuelCost({ ...sharedInput, efficiency: Number.parseFloat(efficiencyB) }) : null),
    [compareEnabled, sharedInput, efficiencyB],
  )

  const savings = useMemo(() => {
    if (!result || !resultB) return null
    return Math.abs(result.totalCost - resultB.totalCost)
  }, [result, resultB])

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <GlassCard className="space-y-5 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("distanceKm")}</Label>
              <Input type="number" min="0" step="0.1" value={distanceKm} onChange={(e) => setDistanceKm(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("fuelPrice")}</Label>
              <Input type="number" min="0" step="1" value={fuelPrice} onChange={(e) => setFuelPrice(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("efficiencyUnit")}</Label>
            <div className="grid grid-cols-3 gap-1">
              {EFFICIENCY_UNITS.map((unit) => (
                <Button
                  key={unit}
                  variant={efficiencyUnit === unit ? "default" : "outline"}
                  size="sm"
                  onClick={() => setEfficiencyUnit(unit)}
                >
                  {t(`units.${unit}`)}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("efficiency")}</Label>
            <Input type="number" min="0" step="0.1" value={efficiency} onChange={(e) => setEfficiency(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>{t("passengers")}</Label>
            <Input type="number" min="1" step="1" value={passengers} onChange={(e) => setPassengers(e.target.value)} />
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-border/50 bg-muted/20 px-4 py-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Repeat className="h-4 w-4 text-sky-500" />
              {t("roundTrip")}
            </Label>
            <Switch checked={roundTrip} onCheckedChange={setRoundTrip} />
          </div>

          <div className="space-y-3 rounded-2xl border border-border/50 bg-muted/20 px-4 py-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Scale className="h-4 w-4 text-violet-500" />
                {t("compareToggle")}
              </Label>
              <Switch checked={compareEnabled} onCheckedChange={setCompareEnabled} />
            </div>
            {compareEnabled && (
              <div className="space-y-2">
                <Label className="text-xs">{t("efficiencyB")}</Label>
                <Input type="number" min="0" step="0.1" value={efficiencyB} onChange={(e) => setEfficiencyB(e.target.value)} />
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border/50 bg-muted/20 p-4 text-sm text-muted-foreground">{t("hint")}</div>
        </GlassCard>

        <div className="grid gap-4 sm:grid-cols-2">
          <GlassCard className="border-sky-500/20 p-5">
            <div className="flex items-start gap-3">
              <Fuel className="mt-1 h-5 w-5 text-sky-500" />
              <div>
                <p className="text-sm text-muted-foreground">{t("fuelNeeded")}</p>
                <p className="mt-2 text-2xl font-black tracking-tight text-sky-500">{result ? `${formatNumber(result.fuelNeeded)} L` : "-"}</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="border-emerald-500/20 p-5">
            <div className="flex items-start gap-3">
              <Coins className="mt-1 h-5 w-5 text-emerald-500" />
              <div>
                <p className="text-sm text-muted-foreground">{t("totalCost")}</p>
                <p className="mt-2 text-2xl font-black tracking-tight text-emerald-500">{result ? formatNumber(result.totalCost, 0) : "-"}</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="border-violet-500/20 p-5">
            <div className="flex items-start gap-3">
              <Users className="mt-1 h-5 w-5 text-violet-500" />
              <div>
                <p className="text-sm text-muted-foreground">{t("costPerPerson")}</p>
                <p className="mt-2 text-2xl font-black tracking-tight text-violet-500">{result ? formatNumber(result.costPerPerson, 0) : "-"}</p>
              </div>
            </div>
          </GlassCard>

          {compareEnabled && (
            <GlassCard className="border-rose-500/20 p-5">
              <div className="flex items-start gap-3">
                <Scale className="mt-1 h-5 w-5 text-rose-500" />
                <div>
                  <p className="text-sm text-muted-foreground">{t("vehicleBCost")}</p>
                  <p className="mt-2 text-2xl font-black tracking-tight text-rose-500">{resultB ? formatNumber(resultB.totalCost, 0) : "-"}</p>
                  {savings !== null && (
                    <p className="mt-1 text-xs text-muted-foreground">{t("savings", { amount: formatNumber(savings, 0) })}</p>
                  )}
                </div>
              </div>
            </GlassCard>
          )}

          <GlassCard className="border-amber-500/20 p-5 sm:col-span-2">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-amber-500/10 p-3">
                <CarFront className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("summaryTitle")}</p>
                <p className="mt-2 text-sm font-medium leading-6">
                  {result
                    ? t("summary", {
                        distance: formatNumber(result.distance, 0),
                        fuel: formatNumber(result.fuelNeeded),
                        cost: formatNumber(result.totalCost, 0),
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

"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { AlarmClock, BedDouble, MoonStar, Sunrise } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const SLEEP_CYCLE_MINUTES = 90
const CYCLE_OPTIONS = [6, 5, 4]

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map((part) => parseInt(part, 10))

  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) {
    return null
  }

  return hours * 60 + minutes
}

function minutesToTimeLabel(totalMinutes: number) {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440
  const hours = Math.floor(normalized / 60)
  const minutes = normalized % 60

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
}

export function SleepCalculatorTool() {
  const t = useTranslations("SleepCalculator")
  const [wakeTime, setWakeTime] = useState("07:00")
  const [bedTime, setBedTime] = useState("23:00")
  const [fallAsleepMinutes, setFallAsleepMinutes] = useState("15")

  const wakePlans = useMemo(() => {
    const wake = timeToMinutes(wakeTime)
    const latency = parseInt(fallAsleepMinutes, 10)

    if (wake === null || !Number.isFinite(latency)) {
      return []
    }

    return CYCLE_OPTIONS.map((cycles) => {
      const sleepMinutes = cycles * SLEEP_CYCLE_MINUTES
      return {
        cycles,
        hours: sleepMinutes / 60,
        label: minutesToTimeLabel(wake - latency - sleepMinutes),
      }
    })
  }, [fallAsleepMinutes, wakeTime])

  const bedPlans = useMemo(() => {
    const bed = timeToMinutes(bedTime)
    const latency = parseInt(fallAsleepMinutes, 10)

    if (bed === null || !Number.isFinite(latency)) {
      return []
    }

    return CYCLE_OPTIONS.map((cycles) => {
      const sleepMinutes = cycles * SLEEP_CYCLE_MINUTES
      return {
        cycles,
        hours: sleepMinutes / 60,
        label: minutesToTimeLabel(bed + latency + sleepMinutes),
      }
    })
  }, [bedTime, fallAsleepMinutes])

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <GlassCard className="p-6 border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-transparent">
        <div className="flex items-start gap-3">
          <MoonStar className="mt-0.5 h-5 w-5 text-indigo-500" />
          <p className="text-sm leading-relaxed text-muted-foreground">{t("hint")}</p>
        </div>
      </GlassCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard className="p-6 space-y-5">
          <div className="flex items-center gap-2">
            <AlarmClock className="h-5 w-5 text-sky-500" />
            <h3 className="font-semibold">{t("wakeTitle")}</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("wakeTime")}</Label>
              <Input type="time" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("fallAsleepMinutes")}</Label>
              <Input type="number" min="0" step="1" value={fallAsleepMinutes} onChange={(e) => setFallAsleepMinutes(e.target.value)} />
            </div>
          </div>

          <div className="space-y-3">
            {wakePlans.map((plan) => (
              <div key={`wake-${plan.cycles}`} className="rounded-2xl border border-border/50 bg-muted/20 px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">{plan.label}</p>
                    <p className="text-sm text-muted-foreground">{t("cycleSummary", { cycles: plan.cycles, hours: plan.hours.toFixed(1) })}</p>
                  </div>
                  <Sunrise className="h-4 w-4 text-sky-500" />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-6 space-y-5">
          <div className="flex items-center gap-2">
            <BedDouble className="h-5 w-5 text-violet-500" />
            <h3 className="font-semibold">{t("bedTitle")}</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("bedTime")}</Label>
              <Input type="time" value={bedTime} onChange={(e) => setBedTime(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("fallAsleepMinutes")}</Label>
              <Input type="number" min="0" step="1" value={fallAsleepMinutes} onChange={(e) => setFallAsleepMinutes(e.target.value)} />
            </div>
          </div>

          <div className="space-y-3">
            {bedPlans.map((plan) => (
              <div key={`bed-${plan.cycles}`} className="rounded-2xl border border-border/50 bg-muted/20 px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">{plan.label}</p>
                    <p className="text-sm text-muted-foreground">{t("cycleSummary", { cycles: plan.cycles, hours: plan.hours.toFixed(1) })}</p>
                  </div>
                  <MoonStar className="h-4 w-4 text-violet-500" />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Activity, Ruler, Scale, UserRound } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Sex = "male" | "female"

function getCategory(sex: Sex, value: number) {
  if (sex === "male") {
    if (value < 6) return "essential"
    if (value < 14) return "athletic"
    if (value < 18) return "fit"
    if (value < 25) return "average"
    return "high"
  }

  if (value < 14) return "essential"
  if (value < 21) return "athletic"
  if (value < 25) return "fit"
  if (value < 32) return "average"
  return "high"
}

export function BodyFatCalculatorTool() {
  const t = useTranslations("BodyFatCalculator")
  const [sex, setSex] = useState<Sex>("male")
  const [age, setAge] = useState("30")
  const [heightCm, setHeightCm] = useState("175")
  const [weightKg, setWeightKg] = useState("72")
  const [waistCm, setWaistCm] = useState("82")
  const [neckCm, setNeckCm] = useState("38")
  const [hipCm, setHipCm] = useState("96")

  const result = useMemo(() => {
    const ageValue = Number.parseFloat(age)
    const height = Number.parseFloat(heightCm)
    const weight = Number.parseFloat(weightKg)
    const waist = Number.parseFloat(waistCm)
    const neck = Number.parseFloat(neckCm)
    const hip = Number.parseFloat(hipCm)

    if (
      !Number.isFinite(ageValue) ||
      !Number.isFinite(height) ||
      !Number.isFinite(weight) ||
      !Number.isFinite(waist) ||
      !Number.isFinite(neck) ||
      ageValue <= 0 ||
      height <= 0 ||
      weight <= 0 ||
      waist <= 0 ||
      neck <= 0 ||
      waist <= neck
    ) {
      return null
    }

    if (sex === "female" && (!Number.isFinite(hip) || hip <= 0)) {
      return null
    }

    const bodyFat = sex === "male"
      ? 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450
      : 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.221 * Math.log10(height)) - 450

    if (!Number.isFinite(bodyFat) || bodyFat <= 0) {
      return null
    }

    const fatMass = (weight * bodyFat) / 100
    const leanMass = weight - fatMass
    const category = getCategory(sex, bodyFat)

    return { bodyFat, fatMass, leanMass, category }
  }, [age, heightCm, hipCm, neckCm, sex, waistCm, weightKg])

  const formatNumber = (value: number, digits = 1) => value.toLocaleString(undefined, { maximumFractionDigits: digits })

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <GlassCard className="space-y-5 p-6">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <UserRound className="h-4 w-4 text-sky-500" />
              {t("sex")}
            </Label>
            <Select value={sex} onValueChange={(value: Sex) => setSex(value)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="male">{t("male")}</SelectItem>
                <SelectItem value="female">{t("female")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2"><Label>{t("age")}</Label><Input type="number" min="0" value={age} onChange={(e) => setAge(e.target.value)} /></div>
            <div className="space-y-2"><Label>{t("heightCm")}</Label><Input type="number" min="0" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} /></div>
            <div className="space-y-2"><Label>{t("weightKg")}</Label><Input type="number" min="0" step="0.1" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} /></div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label>{t("waistCm")}</Label><Input type="number" min="0" step="0.1" value={waistCm} onChange={(e) => setWaistCm(e.target.value)} /></div>
            <div className="space-y-2"><Label>{t("neckCm")}</Label><Input type="number" min="0" step="0.1" value={neckCm} onChange={(e) => setNeckCm(e.target.value)} /></div>
            {sex === "female" ? <div className="space-y-2 sm:col-span-2"><Label>{t("hipCm")}</Label><Input type="number" min="0" step="0.1" value={hipCm} onChange={(e) => setHipCm(e.target.value)} /></div> : null}
          </div>

          <div className="rounded-2xl border border-border/50 bg-muted/20 p-4 text-sm text-muted-foreground">{t("hint")}</div>
        </GlassCard>

        <div className="grid gap-4 sm:grid-cols-2">
          <GlassCard className="border-amber-500/20 p-5 sm:col-span-2">
            <p className="text-sm text-muted-foreground">{t("bodyFat")}</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-amber-500">{result ? `${formatNumber(result.bodyFat)}%` : "-"}</p>
          </GlassCard>
          <GlassCard className="border-rose-500/20 p-5">
            <p className="text-sm text-muted-foreground">{t("fatMass")}</p>
            <p className="mt-2 text-2xl font-black tracking-tight text-rose-500">{result ? `${formatNumber(result.fatMass)} kg` : "-"}</p>
          </GlassCard>
          <GlassCard className="border-emerald-500/20 p-5">
            <p className="text-sm text-muted-foreground">{t("leanMass")}</p>
            <p className="mt-2 text-2xl font-black tracking-tight text-emerald-500">{result ? `${formatNumber(result.leanMass)} kg` : "-"}</p>
          </GlassCard>
          <GlassCard className="border-sky-500/20 p-5 sm:col-span-2">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-sky-500/10 p-3"><Activity className="h-5 w-5 text-sky-500" /></div>
              <div>
                <p className="text-sm text-muted-foreground">{t("summaryTitle")}</p>
                <p className="mt-2 text-sm font-medium leading-6">{result ? t("summary", { bodyFat: formatNumber(result.bodyFat), fatMass: formatNumber(result.fatMass), leanMass: formatNumber(result.leanMass) }) : t("invalidInput")}</p>
                {result ? <p className="mt-2 text-xs text-muted-foreground">{t(`categories.${result.category}`)}</p> : null}
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}

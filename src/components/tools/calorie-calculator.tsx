"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Activity, Flame, Target, UserRound } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  computeCalories,
  feetInchesToCm,
  lbToKg,
  type ActivityLevel,
  type Goal,
} from "./calorie-calculator.utils"

export function CalorieCalculatorTool() {
  const t = useTranslations("CalorieCalculator")
  const [sex, setSex] = useState<"male" | "female">("male")
  const [age, setAge] = useState("30")
  const [imperial, setImperial] = useState(false)
  // Metric inputs
  const [heightCm, setHeightCm] = useState("170")
  const [weightKg, setWeightKg] = useState("65")
  // Imperial inputs
  const [heightFt, setHeightFt] = useState("5")
  const [heightIn, setHeightIn] = useState("7")
  const [weightLb, setWeightLb] = useState("145")
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("moderate")
  const [goal, setGoal] = useState<Goal>("maintain")

  const result = useMemo(() => {
    const parsedAge = Number.parseFloat(age)

    const height = imperial
      ? feetInchesToCm(Number.parseFloat(heightFt) || 0, Number.parseFloat(heightIn) || 0)
      : Number.parseFloat(heightCm)
    const weight = imperial
      ? lbToKg(Number.parseFloat(weightLb) || 0)
      : Number.parseFloat(weightKg)

    return computeCalories({
      sex,
      age: parsedAge,
      heightCm: height,
      weightKg: weight,
      activity: activityLevel,
      goal,
    })
  }, [age, imperial, heightFt, heightIn, heightCm, weightLb, weightKg, sex, activityLevel, goal])

  const formatCalories = (value: number) => Math.round(value).toLocaleString()
  const formatGrams = (value: number) => `${Math.round(value)} g`

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <GlassCard className="space-y-5 p-6">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <UserRound className="h-4 w-4 text-sky-500" />
              {t("sex")}
            </Label>
            <Select value={sex} onValueChange={(value: "male" | "female") => setSex(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">{t("male")}</SelectItem>
                <SelectItem value="female">{t("female")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 p-4">
            <span className="text-sm text-muted-foreground">{t("useImperial")}</span>
            <Switch checked={imperial} onCheckedChange={setImperial} />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>{t("age")}</Label>
              <Input type="number" min="0" value={age} onChange={(e) => setAge(e.target.value)} />
            </div>

            {imperial ? (
              <>
                <div className="space-y-2">
                  <Label>{t("heightFt")}</Label>
                  <Input type="number" min="0" value={heightFt} onChange={(e) => setHeightFt(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{t("heightIn")}</Label>
                  <Input type="number" min="0" value={heightIn} onChange={(e) => setHeightIn(e.target.value)} />
                </div>
                <div className="space-y-2 sm:col-span-3">
                  <Label>{t("weightLb")}</Label>
                  <Input type="number" min="0" step="0.1" value={weightLb} onChange={(e) => setWeightLb(e.target.value)} />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>{t("heightCm")}</Label>
                  <Input type="number" min="0" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{t("weightKg")}</Label>
                  <Input type="number" min="0" step="0.1" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
                </div>
              </>
            )}
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Activity className="h-4 w-4 text-emerald-500" />
              {t("activityLevel")}
            </Label>
            <Select value={activityLevel} onValueChange={(value: ActivityLevel) => setActivityLevel(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">{t("activity.low")}</SelectItem>
                <SelectItem value="light">{t("activity.light")}</SelectItem>
                <SelectItem value="moderate">{t("activity.moderate")}</SelectItem>
                <SelectItem value="high">{t("activity.high")}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{t("activityHint")}</p>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Target className="h-4 w-4 text-rose-500" />
              {t("goal")}
            </Label>
            <Select value={goal} onValueChange={(value: Goal) => setGoal(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lose">{t("goalLose")}</SelectItem>
                <SelectItem value="maintain">{t("goalMaintain")}</SelectItem>
                <SelectItem value="gain">{t("goalGain")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-2xl border border-border/50 bg-muted/20 p-4 text-sm text-muted-foreground">
            {t("hint")}
          </div>
        </GlassCard>

        <div className="grid gap-4 sm:grid-cols-2">
          <GlassCard className="border-orange-500/20 p-5">
            <p className="text-sm text-muted-foreground">{t("maintenanceCalories")}</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-orange-500">
              {result ? formatCalories(result.maintenance) : "-"}
            </p>
          </GlassCard>

          <GlassCard className="border-sky-500/20 p-5">
            <p className="text-sm text-muted-foreground">{t("targetCalories")}</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-sky-500">
              {result ? formatCalories(result.targetCalories) : "-"}
            </p>
          </GlassCard>

          <GlassCard className="border-violet-500/20 p-5 sm:col-span-2">
            <p className="text-sm text-muted-foreground">{t("macroBreakdown")}</p>
            <div className="mt-3 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-rose-500/10 p-3">
                <p className="text-xs text-muted-foreground">{t("protein")}</p>
                <p className="mt-1 text-xl font-black tracking-tight text-rose-500">
                  {result ? formatGrams(result.macros.protein) : "-"}
                </p>
              </div>
              <div className="rounded-xl bg-amber-500/10 p-3">
                <p className="text-xs text-muted-foreground">{t("carbs")}</p>
                <p className="mt-1 text-xl font-black tracking-tight text-amber-500">
                  {result ? formatGrams(result.macros.carbs) : "-"}
                </p>
              </div>
              <div className="rounded-xl bg-emerald-500/10 p-3">
                <p className="text-xs text-muted-foreground">{t("fat")}</p>
                <p className="mt-1 text-xl font-black tracking-tight text-emerald-500">
                  {result ? formatGrams(result.macros.fat) : "-"}
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="border-amber-500/20 p-5 sm:col-span-2">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-amber-500/10 p-3">
                <Flame className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("summaryTitle")}</p>
                <p className="mt-2 text-sm font-medium leading-6">
                  {result
                    ? t("targetSummary", {
                        target: formatCalories(result.targetCalories),
                        maintenance: formatCalories(result.maintenance),
                        protein: Math.round(result.macros.protein),
                        carbs: Math.round(result.macros.carbs),
                        fat: Math.round(result.macros.fat),
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

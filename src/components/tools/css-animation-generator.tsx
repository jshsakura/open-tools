"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Clipboard, Play } from "lucide-react"
import { toast } from "sonner"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  buildAnimationCss,
  presetToAnimationName,
  KEYFRAMES,
  PRESETS,
  TIMING_FUNCTIONS,
  DIRECTIONS,
  DEFAULT_OPTIONS,
  type AnimationOptions,
  type PresetId,
  type TimingFunction,
  type Direction,
} from "./css-animation-generator.utils"

const MIN_DURATION = 0.1
const MAX_DURATION = 5
const MIN_DELAY = 0
const MAX_DELAY = 3
const MIN_ITERATIONS = 1
const MAX_ITERATIONS = 10

function updateOptions(
  opts: AnimationOptions,
  patch: Partial<AnimationOptions>,
): AnimationOptions {
  return { ...opts, ...patch }
}

export function CssAnimationGenerator() {
  const t = useTranslations("CssAnimationGenerator")
  const [options, setOptions] = useState<AnimationOptions>({ ...DEFAULT_OPTIONS })
  // Bumping this key remounts the preview node, re-triggering the animation.
  const [runKey, setRunKey] = useState(0)

  const css = useMemo(() => buildAnimationCss(options), [options])
  const animationName = useMemo(
    () => presetToAnimationName(options.preset),
    [options.preset],
  )

  const set = (patch: Partial<AnimationOptions>) => {
    setOptions((prev) => updateOptions(prev, patch))
    setRunKey((k) => k + 1)
  }

  const handleReplay = () => setRunKey((k) => k + 1)

  const handleCopy = () => {
    navigator.clipboard.writeText(css.full)
    toast.success(t("copied"))
  }

  const iterationValue = options.infinite
    ? "infinite"
    : String(options.iterationCount)
  const directionValue = options.direction

  return (
    <GlassCard className="mx-auto max-w-5xl">
      <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-2">
        {/* Controls */}
        <div className="space-y-5">
          {/* Preset selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">
              {t("preset")}
            </Label>
            <Select
              value={options.preset}
              onValueChange={(v) => set({ preset: v as PresetId })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRESETS.map((preset) => (
                  <SelectItem key={preset} value={preset}>
                    {t(`presets.${preset}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Duration */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">
              {t("duration")}: {options.duration}s
            </Label>
            <Slider
              min={MIN_DURATION}
              max={MAX_DURATION}
              step={0.1}
              value={[options.duration]}
              onValueChange={([v]) => set({ duration: Number(v.toFixed(1)) })}
            />
          </div>

          {/* Delay */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">
              {t("delay")}: {options.delay}s
            </Label>
            <Slider
              min={MIN_DELAY}
              max={MAX_DELAY}
              step={0.1}
              value={[options.delay]}
              onValueChange={([v]) => set({ delay: Number(v.toFixed(1)) })}
            />
          </div>

          {/* Timing function */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">
              {t("timingFunction")}
            </Label>
            <Select
              value={options.timingFunction}
              onValueChange={(v) => set({ timingFunction: v as TimingFunction })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMING_FUNCTIONS.map((fn) => (
                  <SelectItem key={fn} value={fn}>
                    {fn === "cubic-bezier(0.68, -0.55, 0.27, 1.55)"
                      ? t("timingBezier")
                      : fn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Iteration count */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">
              {t("iterationCount")}
            </Label>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min={MIN_ITERATIONS}
                max={MAX_ITERATIONS}
                disabled={options.infinite}
                value={options.iterationCount}
                onChange={(e) =>
                  set({ iterationCount: Math.max(MIN_ITERATIONS, Number(e.target.value)) })
                }
                className="w-24 font-mono"
              />
              <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={options.infinite}
                  onChange={(e) => set({ infinite: e.target.checked })}
                  className="accent-primary"
                />
                {t("infinite")}
              </label>
            </div>
          </div>

          {/* Direction */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">
              {t("direction")}
            </Label>
            <Select
              value={directionValue}
              onValueChange={(v) => set({ direction: v as Direction })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DIRECTIONS.map((dir) => (
                  <SelectItem key={dir} value={dir}>
                    {dir}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Preview + output */}
        <div className="space-y-4">
          {/* Live preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-muted-foreground">
                {t("preview")}
              </Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReplay}
                className="h-7 gap-1.5"
              >
                <Play className="h-3.5 w-3.5" />
                {t("replay")}
              </Button>
            </div>
            <div className="flex min-h-[200px] items-center justify-center overflow-hidden rounded-lg bg-muted/20 p-4">
              {/* Inject keyframes scoped to this tool. */}
              <style>{`${KEYFRAMES[options.preset] ? css.keyframes : ""}`}</style>
              <div
                key={runKey}
                aria-label={t("preview")}
                className="h-16 w-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg"
                style={{
                  animationName,
                  animationDuration: `${options.duration}s`,
                  animationDelay: `${options.delay}s`,
                  animationTimingFunction: options.timingFunction,
                  animationIterationCount: options.infinite
                    ? "infinite"
                    : options.iterationCount,
                  animationDirection: options.direction,
                  animationFillMode: "both",
                }}
              />
            </div>
          </div>

          {/* Output */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-muted-foreground">
                {t("output")}
              </Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="gap-1.5"
              >
                <Clipboard className="h-3.5 w-3.5" />
                {t("copy")}
              </Button>
            </div>
            <pre className="min-h-[180px] select-all whitespace-pre-wrap rounded-lg bg-muted p-4 font-mono text-xs">
              {css.full}
            </pre>
            <div className="rounded-lg bg-muted/40 p-3">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {t("shorthandLabel")}
              </span>
              <code className="mt-1 block select-all break-all font-mono text-xs">
                {css.shorthand}
              </code>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  )
}

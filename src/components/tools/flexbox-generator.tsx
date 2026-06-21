"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Clipboard, AlignHorizontalSpaceBetween } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { GlassCard } from "@/components/ui/glass-card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  buildFlexCss,
  buildFlexTailwind,
  DEFAULT_FLEX_OPTIONS,
  FLEX_DIRECTIONS,
  JUSTIFY_CONTENTS,
  ALIGN_ITEMS,
  ALIGN_CONTENTS,
  FLEX_WRAPS,
  type FlexOptions,
} from "./flexbox-generator.utils"

const MIN_ITEMS = 2
const MAX_ITEMS = 12
const DEFAULT_ITEMS = 5
const MIN_GAP = 0
const MAX_GAP = 48

type Mode = "css" | "tailwind"

export function FlexboxGenerator() {
  const t = useTranslations("FlexboxGenerator")
  const [options, setOptions] = useState<FlexOptions>(DEFAULT_FLEX_OPTIONS)
  const [itemCount, setItemCount] = useState(DEFAULT_ITEMS)
  const [mode, setMode] = useState<Mode>("css")

  const cssCode = useMemo(() => buildFlexCss(options), [options])
  const tailwindCode = useMemo(() => buildFlexTailwind(options), [options])
  const output = mode === "css" ? cssCode : tailwindCode

  const updateOption = <K extends keyof FlexOptions>(key: K, value: FlexOptions[K]) => {
    setOptions((prev) => ({ ...prev, [key]: value }))
  }

  const handleItemCount = (raw: number) => {
    if (Number.isNaN(raw)) return
    const clamped = Math.min(MAX_ITEMS, Math.max(MIN_ITEMS, Math.round(raw)))
    setItemCount(clamped)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output)
      toast.success(t("copied"))
    } catch {
      toast.error(t("copyFailed"))
    }
  }

  const renderSelect = <T extends string>(
    label: string,
    value: T,
    optionsList: readonly T[],
    onChange: (next: T) => void,
  ) => (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={(next) => onChange(next as T)}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {optionsList.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Controls */}
        <GlassCard className="space-y-4 p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {renderSelect(t("flexDirection"), options.flexDirection, FLEX_DIRECTIONS, (v) =>
              updateOption("flexDirection", v),
            )}
            {renderSelect(t("flexWrap"), options.flexWrap, FLEX_WRAPS, (v) =>
              updateOption("flexWrap", v),
            )}
            {renderSelect(t("justifyContent"), options.justifyContent, JUSTIFY_CONTENTS, (v) =>
              updateOption("justifyContent", v),
            )}
            {renderSelect(t("alignItems"), options.alignItems, ALIGN_ITEMS, (v) =>
              updateOption("alignItems", v),
            )}
            {renderSelect(t("alignContent"), options.alignContent, ALIGN_CONTENTS, (v) =>
              updateOption("alignContent", v),
            )}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">
                {t("itemCount")}
              </Label>
              <Input
                type="number"
                min={MIN_ITEMS}
                max={MAX_ITEMS}
                value={itemCount}
                onChange={(e) => handleItemCount(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground">
              {t("gap")}: {options.gap}px
            </Label>
            <Slider
              min={MIN_GAP}
              max={MAX_GAP}
              step={1}
              value={[options.gap]}
              onValueChange={([next]) => updateOption("gap", next)}
              className="mt-2"
            />
          </div>
        </GlassCard>

        {/* Live preview */}
        <GlassCard className="space-y-2 p-6">
          <Label className="text-xs font-semibold text-muted-foreground">{t("preview")}</Label>
          <div
            className="rounded-lg bg-muted/20 p-3"
            style={{
              display: "flex",
              flexDirection: options.flexDirection,
              justifyContent: options.justifyContent,
              alignItems: options.alignItems,
              alignContent: options.alignContent,
              flexWrap: options.flexWrap,
              gap: `${options.gap}px`,
              minHeight: "320px",
            }}
          >
            {Array.from({ length: itemCount }).map((_, i) => (
              <div
                key={i}
                className="flex h-12 w-12 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white"
              >
                {i + 1}
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Output */}
      <GlassCard className="space-y-3 p-6">
        <div className="flex items-center justify-between">
          <div className="inline-flex rounded-md border border-border/50 p-0.5">
            <Button
              variant={mode === "css" ? "default" : "ghost"}
              size="sm"
              className="h-7"
              onClick={() => setMode("css")}
            >
              CSS
            </Button>
            <Button
              variant={mode === "tailwind" ? "default" : "ghost"}
              size="sm"
              className="h-7"
              onClick={() => setMode("tailwind")}
            >
              Tailwind
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
            <Clipboard className="h-3.5 w-3.5" />
            {mode === "css" ? t("copyCss") : t("copyTailwind")}
          </Button>
        </div>
        <pre className="min-h-[120px] select-all whitespace-pre-wrap rounded-lg bg-muted p-4 font-mono text-xs">
          {output}
        </pre>
      </GlassCard>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <AlignHorizontalSpaceBetween className="h-3.5 w-3.5" />
        {t("privacyNote")}
      </div>
    </div>
  )
}

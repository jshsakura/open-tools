"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Copy, Link2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { GlassCard } from "@/components/ui/glass-card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DEFAULT_SLUG_OPTIONS,
  generateSlugs,
  type SlugOptions,
  type SlugSeparator,
} from "./slug-generator.utils"

const MAX_LENGTH_CAP = 200

export function SlugGenerator() {
  const t = useTranslations("SlugGenerator")
  const [text, setText] = useState("안녕하세요 세계\nHello World")
  const [options, setOptions] = useState<SlugOptions>(DEFAULT_SLUG_OPTIONS)

  const slugs = useMemo(() => generateSlugs(text, options), [text, options])
  const output = useMemo(() => slugs.join("\n"), [slugs])

  const updateOption = <K extends keyof SlugOptions>(key: K, value: SlugOptions[K]) => {
    setOptions((prev) => ({ ...prev, [key]: value }))
  }

  const onMaxLengthChange = (value: string) => {
    const parsed = Number.parseInt(value, 10)
    if (value.trim() === "" || Number.isNaN(parsed) || parsed <= 0) {
      updateOption("maxLength", 0)
      return
    }
    updateOption("maxLength", Math.min(parsed, MAX_LENGTH_CAP))
  }

  const copy = (value: string) => {
    if (!value) {
      toast.error(t("nothingToCopy"))
      return
    }
    navigator.clipboard.writeText(value)
    toast.success(t("copied"))
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <GlassCard className="space-y-4 p-6">
        <div className="space-y-2">
          <Label htmlFor="slug-input">{t("inputLabel")}</Label>
          <Textarea
            id="slug-input"
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={5}
            className="font-mono text-sm"
            placeholder={t("inputPlaceholder")}
          />
          <p className="text-xs text-muted-foreground">{t("inputHint")}</p>
        </div>
      </GlassCard>

      <GlassCard className="grid gap-5 p-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>{t("separatorLabel")}</Label>
          <Select
            value={options.separator}
            onValueChange={(value) => updateOption("separator", value as SlugSeparator)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="-">{t("separatorHyphen")}</SelectItem>
              <SelectItem value="_">{t("separatorUnderscore")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug-max-length">{t("maxLengthLabel")}</Label>
          <Input
            id="slug-max-length"
            type="number"
            min={0}
            max={MAX_LENGTH_CAP}
            value={options.maxLength === 0 ? "" : options.maxLength}
            onChange={(event) => onMaxLengthChange(event.target.value)}
            placeholder={t("maxLengthPlaceholder")}
          />
        </div>

        <div className="flex items-center justify-between gap-3 rounded-xl border border-border/40 bg-muted/20 p-3">
          <Label htmlFor="slug-lowercase" className="cursor-pointer">
            {t("lowercaseLabel")}
          </Label>
          <Switch
            id="slug-lowercase"
            checked={options.lowercase}
            onCheckedChange={(checked) => updateOption("lowercase", checked)}
          />
        </div>

        <div className="flex items-center justify-between gap-3 rounded-xl border border-border/40 bg-muted/20 p-3">
          <Label htmlFor="slug-strip" className="cursor-pointer">
            {t("stripSpecialLabel")}
          </Label>
          <Switch
            id="slug-strip"
            checked={options.stripSpecial}
            onCheckedChange={(checked) => updateOption("stripSpecial", checked)}
          />
        </div>
      </GlassCard>

      <GlassCard className="space-y-3 p-6">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-primary" />
            {t("outputLabel")}
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => copy(output)}
            aria-label={t("copy")}
          >
            <Copy className="mr-2 h-4 w-4" />
            {t("copy")}
          </Button>
        </div>

        {slugs.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border/50 p-6 text-center text-sm text-muted-foreground">
            {t("emptyOutput")}
          </p>
        ) : (
          <div className="space-y-2">
            {slugs.map((slug, index) => (
              <div
                key={`${slug}-${index}`}
                className="flex items-center justify-between gap-2 rounded-xl border border-border/50 bg-muted/20 px-4 py-2"
              >
                <code className="break-all font-mono text-sm">{slug}</code>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => copy(slug)}
                  aria-label={t("copy")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  )
}

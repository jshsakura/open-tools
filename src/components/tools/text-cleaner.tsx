"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import {
  Eraser,
  Copy,
  Download,
  Trash2,
  Hash,
  Sparkles,
  ArrowRight,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { GlassCard } from "@/components/ui/glass-card"
import { cn } from "@/lib/utils"
import {
  cleanText,
  countLines,
  DEFAULT_CLEAN_OPTIONS,
  type CaseMode,
  type CleanOptions,
  type SortMode,
} from "./text-cleaner.utils"

type ToggleKey =
  | "trimLines"
  | "collapseSpaces"
  | "removeEmpty"
  | "removeExtraBlank"
  | "removeDuplicates"
  | "removeLineNumbers"
  | "stripHtml"

const TOGGLE_KEYS: ToggleKey[] = [
  "trimLines",
  "collapseSpaces",
  "removeEmpty",
  "removeExtraBlank",
  "removeDuplicates",
  "removeLineNumbers",
  "stripHtml",
]

const SORT_MODES: SortMode[] = ["none", "asc", "desc"]
const CASE_MODES: CaseMode[] = ["none", "lower", "upper", "title"]

export function TextCleaner() {
  const t = useTranslations("TextCleaner")
  const [input, setInput] = useState("")
  const [options, setOptions] = useState<CleanOptions>(DEFAULT_CLEAN_OPTIONS)

  const output = useMemo(() => cleanText(input, options), [input, options])

  const beforeLines = useMemo(() => countLines(input), [input])
  const afterLines = useMemo(() => countLines(output), [output])

  const toggleOption = (key: ToggleKey) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const setSort = (value: SortMode) => {
    setOptions((prev) => ({ ...prev, sort: value }))
  }

  const setCaseMode = (value: CaseMode) => {
    setOptions((prev) => ({ ...prev, caseMode: value }))
  }

  const handleClear = () => {
    setInput("")
  }

  const handleReset = () => {
    setOptions(DEFAULT_CLEAN_OPTIONS)
    toast.success(t("optionsReset"))
  }

  const handleCopy = async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      toast.success(t("copied"))
    } catch {
      toast.error(t("copyFailed"))
    }
  }

  const handleDownload = () => {
    if (!output) return
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "cleaned.txt"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success(t("downloaded"))
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-3 px-1">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <Eraser className="w-4 h-4 text-violet-500" />
              {t("input")}
            </Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={!input}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              {t("clear")}
            </Button>
          </div>
          <Textarea
            placeholder={t("placeholder")}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[320px] font-mono text-sm bg-background/50 focus:bg-background transition-all resize-y leading-relaxed"
            autoFocus
          />
        </GlassCard>

        {/* Output */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-3 px-1">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              {t("output")}
            </Label>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                disabled={!output}
                className="h-7 px-2 text-xs"
              >
                <Copy className="w-3.5 h-3.5 mr-1" />
                {t("copy")}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                disabled={!output}
                className="h-7 px-2 text-xs"
              >
                <Download className="w-3.5 h-3.5 mr-1" />
                {t("download")}
              </Button>
            </div>
          </div>
          <Textarea
            readOnly
            placeholder={t("outputPlaceholder")}
            value={output}
            className="min-h-[320px] font-mono text-sm bg-background/50 resize-y leading-relaxed"
          />
        </GlassCard>
      </div>

      {/* Line count before / after */}
      <div className="grid grid-cols-3 gap-3">
        <GlassCard className={cn("p-4 flex flex-col gap-2", !input && "opacity-60")}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              {t("linesBefore")}
            </span>
            <Hash className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold tracking-tight tabular-nums">
            {beforeLines.toLocaleString()}
          </p>
        </GlassCard>
        <GlassCard className="p-4 flex items-center justify-center">
          <ArrowRight className="w-6 h-6 text-muted-foreground/60" />
        </GlassCard>
        <GlassCard className={cn("p-4 flex flex-col gap-2", !input && "opacity-60")}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              {t("linesAfter")}
            </span>
            <Hash className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold tracking-tight tabular-nums text-emerald-500">
            {afterLines.toLocaleString()}
          </p>
        </GlassCard>
      </div>

      {/* Operations */}
      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-4 px-1">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            {t("operations")}
          </Label>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-7 px-2 text-xs text-muted-foreground"
          >
            {t("reset")}
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
          {TOGGLE_KEYS.map((key) => (
            <div
              key={key}
              className="flex items-center justify-between gap-3 rounded-lg border border-border/40 bg-background/30 px-3 py-2.5"
            >
              <div className="min-w-0">
                <Label
                  htmlFor={`opt-${key}`}
                  className="text-sm font-medium cursor-pointer"
                >
                  {t(`toggles.${key}.label`)}
                </Label>
                <p className="text-xs text-muted-foreground truncate">
                  {t(`toggles.${key}.hint`)}
                </p>
              </div>
              <Switch
                id={`opt-${key}`}
                checked={options[key]}
                onCheckedChange={() => toggleOption(key)}
              />
            </div>
          ))}

          {/* Sort select */}
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border/40 bg-background/30 px-3 py-2.5">
            <Label className="text-sm font-medium">{t("sort.label")}</Label>
            <Select value={options.sort} onValueChange={(v) => setSort(v as SortMode)}>
              <SelectTrigger className="w-[130px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_MODES.map((mode) => (
                  <SelectItem key={mode} value={mode} className="text-xs">
                    {t(`sort.${mode}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Case select */}
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border/40 bg-background/30 px-3 py-2.5">
            <Label className="text-sm font-medium">{t("case.label")}</Label>
            <Select
              value={options.caseMode}
              onValueChange={(v) => setCaseMode(v as CaseMode)}
            >
              <SelectTrigger className="w-[130px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CASE_MODES.map((mode) => (
                  <SelectItem key={mode} value={mode} className="text-xs">
                    {t(`case.${mode}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}

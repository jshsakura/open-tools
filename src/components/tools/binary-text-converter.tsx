"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Binary, Code2, ArrowLeftRight, Copy, Check, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { GlassCard } from "@/components/ui/glass-card"
import {
  codeToText,
  textToCode,
  type NumberBase,
  type Separator,
} from "./binary-text-converter.utils"

const BASES: NumberBase[] = ["binary", "hex", "decimal", "octal"]
const SEPARATORS: Separator[] = ["space", "none", "comma"]

interface ConversionResult {
  output: string
  error: string | null
}

export function BinaryTextConverter() {
  const t = useTranslations("BinaryTextConverter")
  const [input, setInput] = useState("")
  const [isTextToCode, setIsTextToCode] = useState(true)
  const [base, setBase] = useState<NumberBase>("binary")
  const [separator, setSeparator] = useState<Separator>("space")
  const [copied, setCopied] = useState(false)

  const result = useMemo<ConversionResult>(() => {
    if (!input.trim()) return { output: "", error: null }
    try {
      const output = isTextToCode
        ? textToCode(input, base, separator)
        : codeToText(input, base, separator)
      return { output, error: null }
    } catch {
      return { output: "", error: t("invalidInput") }
    }
  }, [input, isTextToCode, base, separator, t])

  const handleCopy = async () => {
    if (!result.output) return
    try {
      await navigator.clipboard.writeText(result.output)
      setCopied(true)
      toast.success(t("copied"))
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error(t("copyFailed"))
    }
  }

  const inputPlaceholder = isTextToCode ? t("textPlaceholder") : t("codePlaceholder")

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <GlassCard className="p-6 space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">
              {t("direction")}
            </Label>
            <Button
              variant="outline"
              onClick={() => setIsTextToCode((prev) => !prev)}
              className="w-full justify-between font-medium"
            >
              <span>{isTextToCode ? t("textToCode") : t("codeToText")}</span>
              <ArrowLeftRight className="w-4 h-4 text-indigo-500" />
            </Button>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">{t("base")}</Label>
            <Select value={base} onValueChange={(value: NumberBase) => setBase(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BASES.map((b) => (
                  <SelectItem key={b} value={b}>
                    {t(`bases.${b}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">
              {t("separator")}
            </Label>
            <Select
              value={separator}
              onValueChange={(value: Separator) => setSeparator(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SEPARATORS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {t(`separators.${s}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-3">
            <Label className="text-sm font-semibold flex items-center gap-2 px-1">
              <Code2 className="w-4 h-4 text-indigo-500" />
              {isTextToCode ? t("textLabel") : t("codeLabel")}
            </Label>
            <Textarea
              placeholder={inputPlaceholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[200px] font-mono text-base bg-background/30 focus:bg-background/50 transition-all"
            />
          </div>

          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between px-1">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <Binary className="w-4 h-4 text-emerald-500" />
                {isTextToCode ? t("codeResult") : t("textResult")}
              </Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                disabled={!result.output}
                className="h-7 text-xs"
              >
                {copied ? (
                  <Check className="w-3 h-3 mr-1" />
                ) : (
                  <Copy className="w-3 h-3 mr-1" />
                )}
                {copied ? t("copied") : t("copy")}
              </Button>
            </div>
            <div className="min-h-[200px] p-4 rounded-md bg-muted/30 border border-border/50 font-mono text-base break-all whitespace-pre-wrap">
              {result.error ? (
                <span className="text-rose-500 not-italic">{result.error}</span>
              ) : (
                result.output || (
                  <span className="text-muted-foreground/30 italic">
                    {t("resultPlaceholder")}
                  </span>
                )
              )}
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setInput("")}
          className="text-xs text-muted-foreground"
        >
          <Trash2 className="w-3 h-3 mr-1" />
          {t("clear")}
        </Button>
      </GlassCard>
    </div>
  )
}

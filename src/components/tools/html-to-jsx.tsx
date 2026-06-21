"use client"

import { useState, useMemo } from "react"
import { useTranslations } from "next-intl"
import {
  FileCode,
  Copy,
  Trash2,
  Check,
  Wand2,
  Download,
  AlertCircle,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { GlassCard } from "@/components/ui/glass-card"
import { htmlToJsx } from "./html-to-jsx.utils"

interface ConversionState {
  jsx: string
  error: string | null
}

const WRAP_TOGGLE_ID = "html-to-jsx-wrap"
const COMPONENT_NAME_ID = "html-to-jsx-component-name"

export function HtmlToJsx() {
  const t = useTranslations("HtmlToJsx")
  const [html, setHtml] = useState("")
  const [wrapComponent, setWrapComponent] = useState(false)
  const [componentName, setComponentName] = useState("Component")
  const [copied, setCopied] = useState(false)

  const { jsx, error }: ConversionState = useMemo(() => {
    if (!html.trim()) return { jsx: "", error: null }
    try {
      return {
        jsx: htmlToJsx(html, { wrapComponent, componentName }),
        error: null,
      }
    } catch (err) {
      return { jsx: "", error: err instanceof Error ? err.message : String(err) }
    }
  }, [html, wrapComponent, componentName])

  const handleCopy = async () => {
    if (!jsx) return
    try {
      await navigator.clipboard.writeText(jsx)
      setCopied(true)
      toast.success(t("copied"))
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error(t("copyError"))
    }
  }

  const handleDownload = () => {
    if (!jsx) return
    const fileName = wrapComponent ? `${componentName || "Component"}.jsx` : "converted.jsx"
    const blob = new Blob([jsx], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
    toast.success(t("downloaded"))
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <GlassCard className="p-6 space-y-6">
        {/* Options */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 px-1">
          <div className="flex items-center gap-3">
            <Switch
              id={WRAP_TOGGLE_ID}
              checked={wrapComponent}
              onCheckedChange={setWrapComponent}
            />
            <Label htmlFor={WRAP_TOGGLE_ID} className="text-sm font-medium cursor-pointer">
              {t("wrapComponent")}
            </Label>
          </div>
          {wrapComponent && (
            <div className="flex-1 max-w-xs space-y-1.5 animate-in fade-in slide-in-from-left-2 duration-300">
              <Label
                htmlFor={COMPONENT_NAME_ID}
                className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest"
              >
                {t("componentName")}
              </Label>
              <Input
                id={COMPONENT_NAME_ID}
                value={componentName}
                onChange={(e) => setComponentName(e.target.value)}
                placeholder="Component"
                className="font-mono text-sm bg-background/30"
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <FileCode className="w-3.5 h-3.5" />
                {t("input")}
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setHtml("")}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                {t("clear")}
              </Button>
            </div>
            <Textarea
              placeholder={t("placeholder")}
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              className="min-h-[450px] font-mono text-sm bg-background/30 focus:bg-background/50 transition-all resize-none"
              autoFocus
            />
          </div>

          {/* Output */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Wand2 className="w-3.5 h-3.5" />
                {t("output")}
              </Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  disabled={!jsx}
                  className="h-7 px-2 text-xs"
                >
                  <Download className="w-3.5 h-3.5 mr-1" />
                  {t("download")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  disabled={!jsx}
                  className="h-7 px-2 text-xs bg-primary/5 hover:bg-primary/10 border-primary/20"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 mr-1" />
                  )}
                  {copied ? t("copied") : t("copy")}
                </Button>
              </div>
            </div>
            {error ? (
              <div className="min-h-[450px] p-4 rounded-md bg-destructive/5 border border-destructive/30 font-mono text-sm flex items-start gap-2 text-destructive">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            ) : (
              <pre className="min-h-[450px] p-4 rounded-md bg-muted/30 border border-border/50 font-mono text-sm overflow-auto whitespace-pre-wrap break-all">
                {jsx || (
                  <span className="text-muted-foreground/50 italic">{t("outputPlaceholder")}</span>
                )}
              </pre>
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  )
}

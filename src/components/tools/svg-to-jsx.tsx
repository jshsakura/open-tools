"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import {
  MonitorPlay,
  Copy,
  CheckCircle2,
  Code2,
  Trash2,
  RefreshCcw,
  Download,
  Eye,
  AlertCircle,
} from "lucide-react"
import { svgToJsx } from "./svg-to-jsx.utils"

interface SvgConversion {
  output: string
  error: string | null
}

const COMPONENT_NAME_ID = "svg-to-jsx-component-name"
const TS_TOGGLE_ID = "svg-to-jsx-typescript"
const PROPS_TOGGLE_ID = "svg-to-jsx-props"

export function SvgToJsxTool() {
  const t = useTranslations("SvgToJsx")
  const [svgInput, setSvgInput] = useState("")
  const [componentName, setComponentName] = useState("SvgIcon")
  const [typescript, setTypescript] = useState(false)
  const [spreadProps, setSpreadProps] = useState(true)
  const [copied, setCopied] = useState(false)

  const { output, error }: SvgConversion = useMemo(() => {
    if (!svgInput.trim()) return { output: "", error: null }
    try {
      return {
        output: svgToJsx(svgInput, { componentName, typescript, spreadProps }),
        error: null,
      }
    } catch (err) {
      return { output: "", error: err instanceof Error ? err.message : String(err) }
    }
  }, [svgInput, componentName, typescript, spreadProps])

  // Only render the preview when the input clearly contains an <svg> element.
  const previewMarkup = useMemo(() => {
    return /<svg[\s>]/i.test(svgInput) ? svgInput : ""
  }, [svgInput])

  const copyToClipboard = async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      toast.success(t("copied"))
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error(t("copyError"))
    }
  }

  const downloadFile = () => {
    if (!output) return
    const ext = typescript ? "tsx" : "jsx"
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${componentName || "SvgIcon"}.${ext}`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(t("downloaded"))
  }

  const clearInput = () => {
    setSvgInput("")
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Panel */}
        <Card className="border-primary/20 bg-card/60 backdrop-blur-sm shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Code2 className="h-5 w-5 text-primary" />
                {t("svgSource")}
              </CardTitle>
              <CardDescription>{t("pasteSvg")}</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={clearInput}
              className="text-muted-foreground/50 hover:text-rose-500"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder='<svg width="100" height="100" ...>'
              value={svgInput}
              onChange={(e) => setSvgInput(e.target.value)}
              className="min-h-[280px] font-mono text-[13px] bg-background/50 border-primary/10 transition-all focus-visible:ring-primary focus-visible:ring-offset-0"
            />

            {/* Live preview of the pasted SVG */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1 flex items-center gap-1.5">
                <Eye className="h-3 w-3" />
                {t("preview")}
              </Label>
              <div className="flex min-h-[100px] items-center justify-center rounded-xl border border-primary/10 bg-[conic-gradient(at_center,_var(--muted)_0_25%,_transparent_0_50%)] bg-[length:16px_16px] p-4">
                {previewMarkup ? (
                  <div
                    className="max-h-[120px] max-w-[120px] [&_svg]:max-h-[120px] [&_svg]:max-w-[120px]"
                    // The SVG is user-provided and rendered for visual preview only.
                    dangerouslySetInnerHTML={{ __html: previewMarkup }}
                  />
                ) : (
                  <span className="text-xs text-muted-foreground/60 italic">
                    {t("previewPlaceholder")}
                  </span>
                )}
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3 pt-1">
              <div className="space-y-1.5">
                <Label
                  htmlFor={COMPONENT_NAME_ID}
                  className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1"
                >
                  {t("componentName")}
                </Label>
                <Input
                  id={COMPONENT_NAME_ID}
                  value={componentName}
                  onChange={(e) => setComponentName(e.target.value)}
                  className="font-mono text-sm bg-background/50 border-primary/10"
                />
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-3">
                <div className="flex items-center gap-2">
                  <Switch id={TS_TOGGLE_ID} checked={typescript} onCheckedChange={setTypescript} />
                  <Label htmlFor={TS_TOGGLE_ID} className="text-sm cursor-pointer">
                    {t("typescript")}
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id={PROPS_TOGGLE_ID}
                    checked={spreadProps}
                    onCheckedChange={setSpreadProps}
                  />
                  <Label htmlFor={PROPS_TOGGLE_ID} className="text-sm cursor-pointer">
                    {t("spreadProps")}
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Output Panel */}
        <Card className="border-primary/20 bg-card/60 backdrop-blur-sm shadow-xl relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 relative z-10">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <RefreshCcw className="h-5 w-5 text-orange-500" />
                {t("jsxOutput")}
              </CardTitle>
              <CardDescription>{t("readyForReact")}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="rounded-xl gap-2 font-bold"
                disabled={!output}
                onClick={downloadFile}
              >
                <Download className="h-4 w-4" />
                {t("download")}
              </Button>
              <Button
                className="rounded-xl gap-2 font-bold"
                disabled={!output}
                onClick={copyToClipboard}
              >
                {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? t("copied") : t("copyCode")}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            {error ? (
              <div className="min-h-[460px] rounded-xl border border-rose-500/30 bg-rose-500/5 p-4 font-mono text-sm flex items-start gap-2 text-rose-500">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            ) : (
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-br from-primary/20 via-transparent to-orange-500/20 rounded-[20px] blur opacity-50 group-hover:opacity-100 transition duration-1000"></div>
                <Textarea
                  readOnly
                  value={output}
                  placeholder={t("outputPlaceholder")}
                  className="min-h-[460px] font-mono text-[13px] bg-background/80 border-primary/10 transition-all backdrop-blur-md relative"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Help / Info */}
      <section className="w-full rounded-[32px] border border-border/20 bg-secondary/20 p-8 backdrop-blur-md sm:p-10">
        <div className="flex gap-6 items-start">
          <div className="p-4 rounded-2xl bg-orange-500/10 text-orange-500 shrink-0">
            <MonitorPlay className="h-8 w-8" />
          </div>
          <div className="max-w-3xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-500/80">
              {t("whyUse")}
            </p>
            <p className="text-base leading-7 text-foreground/90 sm:text-[17px]">{t("whyUseDesc")}</p>
          </div>
        </div>
      </section>
    </div>
  )
}

"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Check, Copy, Download, GitBranch } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { GlassCard } from "@/components/ui/glass-card"
import { cn } from "@/lib/utils"
import { GITIGNORE_TEMPLATES, buildGitignore } from "./gitignore-generator.utils"

const COPY_RESET_MS = 2000

export function GitignoreGenerator() {
  const t = useTranslations("GitignoreGenerator")
  const [selected, setSelected] = useState<string[]>(["node"])
  const [copied, setCopied] = useState(false)

  const output = useMemo(() => buildGitignore(selected), [selected])

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  const handleCopy = async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), COPY_RESET_MS)
    } catch (error) {
      console.error("Failed to copy .gitignore:", error)
    }
  }

  const handleDownload = () => {
    if (!output) return
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = ".gitignore"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <GlassCard className="space-y-4 p-6">
        <p className="text-sm font-medium">{t("selectLabel")}</p>
        <div className="flex flex-wrap gap-2">
          {GITIGNORE_TEMPLATES.map((tpl) => {
            const active = selected.includes(tpl.id)
            return (
              <Button
                key={tpl.id}
                variant={active ? "default" : "outline"}
                size="sm"
                onClick={() => toggle(tpl.id)}
              >
                {active && <Check className="mr-2 h-3.5 w-3.5" />}
                {tpl.label}
              </Button>
            )
          })}
        </div>
      </GlassCard>

      <GlassCard className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {selected.length > 0
              ? t("selectedCount", { count: selected.length })
              : t("emptyHint")}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={!output}
            >
              <Download className="mr-2 h-4 w-4" />
              {t("download")}
            </Button>
            <Button size="sm" onClick={handleCopy} disabled={!output}>
              {copied ? (
                <Check className="mr-2 h-4 w-4" />
              ) : (
                <Copy className="mr-2 h-4 w-4" />
              )}
              {copied ? t("copied") : t("copy")}
            </Button>
          </div>
        </div>

        <Textarea
          readOnly
          value={output}
          placeholder={t("emptyHint")}
          className={cn("min-h-[320px] resize-y font-mono text-sm leading-relaxed")}
          aria-label={t("outputLabel")}
        />
      </GlassCard>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <GitBranch className="h-3.5 w-3.5" />
        {t("privacyNote")}
      </div>
    </div>
  )
}

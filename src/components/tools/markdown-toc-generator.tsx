"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Copy, Download, ListTree } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
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
  DEFAULT_TOC_OPTIONS,
  HEADING_DEPTH_MAX,
  HEADING_DEPTH_MIN,
  generateToc,
} from "./markdown-toc-generator.utils"

const SAMPLE = `# Getting Started

## Installation

### Requirements

## Usage

### Basic Example

### Advanced Example

## FAQ
`

const DEPTH_OPTIONS = Array.from(
  { length: HEADING_DEPTH_MAX - HEADING_DEPTH_MIN + 1 },
  (_, index) => HEADING_DEPTH_MIN + index,
)

export function MarkdownTocGenerator() {
  const t = useTranslations("MarkdownTocGenerator")
  const [input, setInput] = useState(SAMPLE)
  const [minDepth, setMinDepth] = useState(DEFAULT_TOC_OPTIONS.minDepth)
  const [maxDepth, setMaxDepth] = useState(DEFAULT_TOC_OPTIONS.maxDepth)
  const [ordered, setOrdered] = useState(DEFAULT_TOC_OPTIONS.ordered)
  const [wrapInMarkers, setWrapInMarkers] = useState(
    DEFAULT_TOC_OPTIONS.wrapInMarkers,
  )

  const output = useMemo(
    () =>
      generateToc(input, {
        minDepth,
        maxDepth,
        ordered,
        wrapInMarkers,
      }),
    [input, minDepth, maxDepth, ordered, wrapInMarkers],
  )

  const copy = () => {
    if (!output) {
      toast.error(t("emptyOutput"))
      return
    }
    navigator.clipboard.writeText(output)
    toast.success(t("copied"))
  }

  const download = () => {
    if (!output) {
      toast.error(t("emptyOutput"))
      return
    }
    const blob = new Blob([output], { type: "text/markdown;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "table-of-contents.md"
    link.click()
    URL.revokeObjectURL(url)
    toast.success(t("downloaded"))
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <GlassCard className="space-y-4 p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label>{t("minDepth")}</Label>
            <Select
              value={String(minDepth)}
              onValueChange={(value) => setMinDepth(Number(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEPTH_OPTIONS.map((depth) => (
                  <SelectItem key={depth} value={String(depth)}>
                    {"#".repeat(depth)} H{depth}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t("maxDepth")}</Label>
            <Select
              value={String(maxDepth)}
              onValueChange={(value) => setMaxDepth(Number(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEPTH_OPTIONS.map((depth) => (
                  <SelectItem key={depth} value={String(depth)}>
                    {"#".repeat(depth)} H{depth}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-2 sm:col-span-1">
            <Label htmlFor="ordered-switch">{t("ordered")}</Label>
            <Switch
              id="ordered-switch"
              checked={ordered}
              onCheckedChange={setOrdered}
            />
          </div>

          <div className="flex items-center justify-between gap-2 sm:col-span-1">
            <Label htmlFor="markers-switch">{t("wrapInMarkers")}</Label>
            <Switch
              id="markers-switch"
              checked={wrapInMarkers}
              onCheckedChange={setWrapInMarkers}
            />
          </div>
        </div>
      </GlassCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard className="space-y-2 p-6">
          <Label htmlFor="md-input">{t("inputLabel")}</Label>
          <Textarea
            id="md-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={t("inputPlaceholder")}
            spellCheck={false}
            className="min-h-[360px] font-mono text-sm"
          />
        </GlassCard>

        <GlassCard className="space-y-2 p-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="md-output">{t("outputLabel")}</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={copy}
                disabled={!output}
              >
                <Copy className="mr-2 h-4 w-4" />
                {t("copy")}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={download}
                disabled={!output}
              >
                <Download className="mr-2 h-4 w-4" />
                {t("download")}
              </Button>
            </div>
          </div>
          {output ? (
            <Textarea
              id="md-output"
              value={output}
              readOnly
              spellCheck={false}
              className="min-h-[360px] font-mono text-sm"
            />
          ) : (
            <div className="flex min-h-[360px] flex-col items-center justify-center rounded-md border border-dashed border-border/50 text-center text-sm text-muted-foreground">
              <ListTree className="mb-2 h-8 w-8 opacity-40" />
              <p>{t("emptyOutput")}</p>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  )
}

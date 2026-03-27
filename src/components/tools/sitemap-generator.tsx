"use client"

import { useState, useMemo } from "react"
import { useTranslations } from "next-intl"
import { Copy, Check, Download, Plus, Trash2, Map, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface SitemapUrl {
  loc: string
  lastmod: string
  changefreq: string
  priority: number
  error?: string
}

const CHANGEFREQ_OPTIONS = ["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"]

function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function SitemapGenerator() {
  const t = useTranslations("SitemapGenerator")
  const [copied, setCopied] = useState(false)
  const [urls, setUrls] = useState<SitemapUrl[]>([
    { loc: "https://example.com/", lastmod: new Date().toISOString().split("T")[0], changefreq: "weekly", priority: 1.0 },
  ])

  const addUrl = () => {
    setUrls((prev) => [
      ...prev,
      { loc: "", lastmod: new Date().toISOString().split("T")[0], changefreq: "monthly", priority: 0.5 },
    ])
  }

  const removeUrl = (index: number) => {
    setUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const updateUrl = (index: number, key: keyof SitemapUrl, value: string | number) => {
    setUrls((prev) =>
      prev.map((u, i) => {
        if (i !== index) return u
        const updated = { ...u, [key]: value }
        if (key === "loc") {
          updated.error = value && !isValidUrl(value as string) ? t("invalidUrl") : undefined
        }
        return updated
      })
    )
  }

  const generatedXml = useMemo(() => {
    const validUrls = urls.filter((u) => u.loc && !u.error)
    if (validUrls.length === 0) return ""

    const lines = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]

    validUrls.forEach((u) => {
      lines.push("  <url>")
      lines.push(`    <loc>${escapeXml(u.loc)}</loc>`)
      if (u.lastmod) lines.push(`    <lastmod>${u.lastmod}</lastmod>`)
      if (u.changefreq) lines.push(`    <changefreq>${u.changefreq}</changefreq>`)
      lines.push(`    <priority>${u.priority.toFixed(1)}</priority>`)
      lines.push("  </url>")
    })

    lines.push("</urlset>")
    return lines.join("\n")
  }, [urls])

  const copyAll = () => {
    if (!generatedXml) return
    navigator.clipboard.writeText(generatedXml)
    setCopied(true)
    toast.success(t("copied"))
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadFile = () => {
    if (!generatedXml) return
    const blob = new Blob([generatedXml], { type: "application/xml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "sitemap.xml"
    a.click()
    URL.revokeObjectURL(url)
    toast.success(t("downloaded"))
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* URL Entries */}
      {urls.map((entry, i) => (
        <Card key={i}>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Map className="w-4 h-4 text-primary" />
                URL #{i + 1}
              </Label>
              {urls.length > 1 && (
                <Button variant="ghost" size="sm" onClick={() => removeUrl(i)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t("url")}</Label>
              <div className="relative">
                <Input
                  value={entry.loc}
                  onChange={(e) => updateUrl(i, "loc", e.target.value)}
                  placeholder="https://example.com/page"
                  className={cn(entry.error && "border-destructive")}
                />
                {entry.error && (
                  <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {entry.error}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{t("lastmod")}</Label>
                <Input type="date" value={entry.lastmod} onChange={(e) => updateUrl(i, "lastmod", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t("changefreq")}</Label>
                <Select value={entry.changefreq} onValueChange={(v) => updateUrl(i, "changefreq", v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CHANGEFREQ_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {t(`freq.${opt}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("priority")}: {entry.priority.toFixed(1)}</Label>
                <Slider
                  min={0}
                  max={1}
                  step={0.1}
                  value={[entry.priority]}
                  onValueChange={([v]) => updateUrl(i, "priority", v)}
                  className="mt-3"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Button variant="outline" onClick={addUrl} className="w-full">
        <Plus className="w-4 h-4 mr-2" /> {t("addUrl")}
      </Button>

      {/* Preview */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-lg font-semibold">{t("preview")}</Label>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyAll} disabled={!generatedXml}>
                {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                {copied ? t("copied") : t("copy")}
              </Button>
              <Button variant="outline" size="sm" onClick={downloadFile} disabled={!generatedXml}>
                <Download className="w-4 h-4 mr-1" /> {t("download")}
              </Button>
            </div>
          </div>
          <pre className="bg-muted/50 rounded-lg p-4 text-sm font-mono overflow-x-auto whitespace-pre">
            {generatedXml || t("emptyPreview")}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

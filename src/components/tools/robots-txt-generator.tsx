"use client"

import { useState, useMemo } from "react"
import { useTranslations } from "next-intl"
import { Copy, Check, Download, Plus, Trash2, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface RuleGroup {
  userAgent: string
  allow: string[]
  disallow: string[]
}

export function RobotsTxtGenerator() {
  const t = useTranslations("RobotsTxtGenerator")
  const [copied, setCopied] = useState(false)
  const [sitemapUrl, setSitemapUrl] = useState("")
  const [crawlDelay, setCrawlDelay] = useState("")
  const [ruleGroups, setRuleGroups] = useState<RuleGroup[]>([
    { userAgent: "*", allow: ["/"], disallow: [] },
  ])

  const addRuleGroup = () => {
    setRuleGroups((prev) => [...prev, { userAgent: "*", allow: [], disallow: [] }])
  }

  const removeRuleGroup = (index: number) => {
    setRuleGroups((prev) => prev.filter((_, i) => i !== index))
  }

  const updateUserAgent = (index: number, value: string) => {
    setRuleGroups((prev) => prev.map((g, i) => (i === index ? { ...g, userAgent: value } : g)))
  }

  const addPath = (groupIndex: number, type: "allow" | "disallow") => {
    setRuleGroups((prev) =>
      prev.map((g, i) =>
        i === groupIndex ? { ...g, [type]: [...g[type], "/"] } : g
      )
    )
  }

  const removePath = (groupIndex: number, type: "allow" | "disallow", pathIndex: number) => {
    setRuleGroups((prev) =>
      prev.map((g, i) =>
        i === groupIndex ? { ...g, [type]: g[type].filter((_, pi) => pi !== pathIndex) } : g
      )
    )
  }

  const updatePath = (groupIndex: number, type: "allow" | "disallow", pathIndex: number, value: string) => {
    setRuleGroups((prev) =>
      prev.map((g, i) =>
        i === groupIndex
          ? { ...g, [type]: g[type].map((p, pi) => (pi === pathIndex ? value : p)) }
          : g
      )
    )
  }

  const applyPreset = (preset: string) => {
    switch (preset) {
      case "allowAll":
        setRuleGroups([{ userAgent: "*", allow: ["/"], disallow: [] }])
        setSitemapUrl("")
        setCrawlDelay("")
        break
      case "blockAll":
        setRuleGroups([{ userAgent: "*", allow: [], disallow: ["/"] }])
        setSitemapUrl("")
        setCrawlDelay("")
        break
      case "blockAI":
        setRuleGroups([
          { userAgent: "*", allow: ["/"], disallow: [] },
          { userAgent: "GPTBot", allow: [], disallow: ["/"] },
          { userAgent: "ChatGPT-User", allow: [], disallow: ["/"] },
          { userAgent: "CCBot", allow: [], disallow: ["/"] },
          { userAgent: "anthropic-ai", allow: [], disallow: ["/"] },
          { userAgent: "Google-Extended", allow: [], disallow: ["/"] },
        ])
        setSitemapUrl("")
        setCrawlDelay("")
        break
      case "standard":
        setRuleGroups([
          { userAgent: "*", allow: ["/"], disallow: ["/admin/", "/private/", "/api/", "/tmp/"] },
        ])
        setSitemapUrl("https://example.com/sitemap.xml")
        setCrawlDelay("10")
        break
    }
  }

  const generatedText = useMemo(() => {
    const lines: string[] = []
    ruleGroups.forEach((group, i) => {
      if (i > 0) lines.push("")
      lines.push(`User-agent: ${group.userAgent}`)
      group.allow.forEach((p) => lines.push(`Allow: ${p}`))
      group.disallow.forEach((p) => lines.push(`Disallow: ${p}`))
      if (crawlDelay && i === 0) lines.push(`Crawl-delay: ${crawlDelay}`)
    })
    if (sitemapUrl) {
      lines.push("")
      lines.push(`Sitemap: ${sitemapUrl}`)
    }
    return lines.join("\n")
  }, [ruleGroups, sitemapUrl, crawlDelay])

  const copyAll = () => {
    navigator.clipboard.writeText(generatedText)
    setCopied(true)
    toast.success(t("copied"))
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadFile = () => {
    const blob = new Blob([generatedText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "robots.txt"
    a.click()
    URL.revokeObjectURL(url)
    toast.success(t("downloaded"))
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Presets */}
      <Card>
        <CardContent className="pt-6">
          <Label className="text-base font-semibold mb-3 block">{t("presets")}</Label>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => applyPreset("allowAll")}>{t("presetAllowAll")}</Button>
            <Button variant="outline" size="sm" onClick={() => applyPreset("blockAll")}>{t("presetBlockAll")}</Button>
            <Button variant="outline" size="sm" onClick={() => applyPreset("blockAI")}>{t("presetBlockAI")}</Button>
            <Button variant="outline" size="sm" onClick={() => applyPreset("standard")}>{t("presetStandard")}</Button>
          </div>
        </CardContent>
      </Card>

      {/* Rule Groups */}
      {ruleGroups.map((group, gi) => (
        <Card key={gi}>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Bot className="w-4 h-4 text-primary" />
                {t("ruleGroup")} #{gi + 1}
              </Label>
              {ruleGroups.length > 1 && (
                <Button variant="ghost" size="sm" onClick={() => removeRuleGroup(gi)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t("userAgent")}</Label>
              <Input value={group.userAgent} onChange={(e) => updateUserAgent(gi, e.target.value)} placeholder="*" />
            </div>

            {/* Allow paths */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-green-600 font-medium">{t("allowPaths")}</Label>
                <Button variant="ghost" size="sm" onClick={() => addPath(gi, "allow")}>
                  <Plus className="w-3 h-3 mr-1" /> {t("addPath")}
                </Button>
              </div>
              {group.allow.map((p, pi) => (
                <div key={pi} className="flex gap-2">
                  <Input value={p} onChange={(e) => updatePath(gi, "allow", pi, e.target.value)} placeholder="/" />
                  <Button variant="ghost" size="icon" onClick={() => removePath(gi, "allow", pi)} className="shrink-0 text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Disallow paths */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-red-600 font-medium">{t("disallowPaths")}</Label>
                <Button variant="ghost" size="sm" onClick={() => addPath(gi, "disallow")}>
                  <Plus className="w-3 h-3 mr-1" /> {t("addPath")}
                </Button>
              </div>
              {group.disallow.map((p, pi) => (
                <div key={pi} className="flex gap-2">
                  <Input value={p} onChange={(e) => updatePath(gi, "disallow", pi, e.target.value)} placeholder="/admin/" />
                  <Button variant="ghost" size="icon" onClick={() => removePath(gi, "disallow", pi)} className="shrink-0 text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <Button variant="outline" onClick={addRuleGroup} className="w-full">
        <Plus className="w-4 h-4 mr-2" /> {t("addRuleGroup")}
      </Button>

      {/* Sitemap & Crawl-delay */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("sitemapUrl")}</Label>
              <Input value={sitemapUrl} onChange={(e) => setSitemapUrl(e.target.value)} placeholder="https://example.com/sitemap.xml" />
            </div>
            <div className="space-y-2">
              <Label>{t("crawlDelay")}</Label>
              <Input type="number" min="0" value={crawlDelay} onChange={(e) => setCrawlDelay(e.target.value)} placeholder="10" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-lg font-semibold">{t("preview")}</Label>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyAll}>
                {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                {copied ? t("copied") : t("copy")}
              </Button>
              <Button variant="outline" size="sm" onClick={downloadFile}>
                <Download className="w-4 h-4 mr-1" /> {t("download")}
              </Button>
            </div>
          </div>
          <pre className="bg-muted/50 rounded-lg p-4 text-sm font-mono overflow-x-auto whitespace-pre">
            {generatedText}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}

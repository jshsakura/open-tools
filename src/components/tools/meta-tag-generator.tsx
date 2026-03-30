"use client"

import { useState, useMemo } from "react"
import { useTranslations } from "next-intl"
import { Copy, Check, Eye, Code, Globe, Twitter, Facebook } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface MetaState {
  title: string
  description: string
  keywords: string
  author: string
  viewport: string
  ogTitle: string
  ogDescription: string
  ogImage: string
  ogType: string
  ogUrl: string
  twitterCard: string
  twitterTitle: string
  twitterDescription: string
  twitterImage: string
}

export function MetaTagGenerator() {
  const t = useTranslations("MetaTagGenerator")
  const [copied, setCopied] = useState(false)

  const [meta, setMeta] = useState<MetaState>({
    title: "",
    description: "",
    keywords: "",
    author: "",
    viewport: "width=device-width, initial-scale=1.0",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    ogType: "website",
    ogUrl: "",
    twitterCard: "summary_large_image",
    twitterTitle: "",
    twitterDescription: "",
    twitterImage: "",
  })

  const update = (key: keyof MetaState, value: string) => {
    setMeta((prev) => ({ ...prev, [key]: value }))
  }

  const generatedTags = useMemo(() => {
    const lines: string[] = []
    if (meta.title) lines.push(`<title>${meta.title}</title>`)
    if (meta.description) lines.push(`<meta name="description" content="${meta.description}" />`)
    if (meta.keywords) lines.push(`<meta name="keywords" content="${meta.keywords}" />`)
    if (meta.author) lines.push(`<meta name="author" content="${meta.author}" />`)
    if (meta.viewport) lines.push(`<meta name="viewport" content="${meta.viewport}" />`)
    lines.push("")
    if (meta.ogTitle) lines.push(`<meta property="og:title" content="${meta.ogTitle}" />`)
    if (meta.ogDescription) lines.push(`<meta property="og:description" content="${meta.ogDescription}" />`)
    if (meta.ogImage) lines.push(`<meta property="og:image" content="${meta.ogImage}" />`)
    if (meta.ogType) lines.push(`<meta property="og:type" content="${meta.ogType}" />`)
    if (meta.ogUrl) lines.push(`<meta property="og:url" content="${meta.ogUrl}" />`)
    lines.push("")
    if (meta.twitterCard) lines.push(`<meta name="twitter:card" content="${meta.twitterCard}" />`)
    if (meta.twitterTitle) lines.push(`<meta name="twitter:title" content="${meta.twitterTitle}" />`)
    if (meta.twitterDescription) lines.push(`<meta name="twitter:description" content="${meta.twitterDescription}" />`)
    if (meta.twitterImage) lines.push(`<meta name="twitter:image" content="${meta.twitterImage}" />`)
    return lines.filter((l) => l !== "" || lines.indexOf(l) === lines.lastIndexOf(l) ? true : l.trim() !== "").join("\n")
  }, [meta])

  const copyAll = () => {
    navigator.clipboard.writeText(generatedTags)
    setCopied(true)
    toast.success(t("copied"))
    setTimeout(() => setCopied(false), 2000)
  }

  const previewTitle = meta.ogTitle || meta.title || t("previewSiteTitle")
  const previewDesc = meta.ogDescription || meta.description || t("previewSiteDesc")
  const previewUrl = meta.ogUrl || "https://example.com"

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">{t("tabs.basic")}</TabsTrigger>
          <TabsTrigger value="og">{t("tabs.og")}</TabsTrigger>
          <TabsTrigger value="twitter">{t("tabs.twitter")}</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>{t("pageTitle")}</Label>
                <Input value={meta.title} onChange={(e) => update("title", e.target.value)} placeholder={t("pageTitlePlaceholder")} />
              </div>
              <div className="space-y-2">
                <Label>{t("pageDescription")}</Label>
                <Textarea value={meta.description} onChange={(e) => update("description", e.target.value)} placeholder={t("pageDescriptionPlaceholder")} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>{t("keywords")}</Label>
                <Input value={meta.keywords} onChange={(e) => update("keywords", e.target.value)} placeholder={t("keywordsPlaceholder")} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("author")}</Label>
                  <Input value={meta.author} onChange={(e) => update("author", e.target.value)} placeholder={t("authorPlaceholder")} />
                </div>
                <div className="space-y-2">
                  <Label>{t("viewport")}</Label>
                  <Input value={meta.viewport} onChange={(e) => update("viewport", e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="og">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>og:title</Label>
                <Input value={meta.ogTitle} onChange={(e) => update("ogTitle", e.target.value)} placeholder={meta.title || t("ogTitlePlaceholder")} />
              </div>
              <div className="space-y-2">
                <Label>og:description</Label>
                <Textarea value={meta.ogDescription} onChange={(e) => update("ogDescription", e.target.value)} placeholder={meta.description || t("ogDescPlaceholder")} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>og:image</Label>
                <Input value={meta.ogImage} onChange={(e) => update("ogImage", e.target.value)} placeholder="https://example.com/image.jpg" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>og:type</Label>
                  <Select value={meta.ogType} onValueChange={(v) => update("ogType", v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website">website</SelectItem>
                      <SelectItem value="article">article</SelectItem>
                      <SelectItem value="product">product</SelectItem>
                      <SelectItem value="profile">profile</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>og:url</Label>
                  <Input value={meta.ogUrl} onChange={(e) => update("ogUrl", e.target.value)} placeholder="https://example.com" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="twitter">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>twitter:card</Label>
                <Select value={meta.twitterCard} onValueChange={(v) => update("twitterCard", v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="summary">summary</SelectItem>
                    <SelectItem value="summary_large_image">summary_large_image</SelectItem>
                    <SelectItem value="app">app</SelectItem>
                    <SelectItem value="player">player</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>twitter:title</Label>
                <Input value={meta.twitterTitle} onChange={(e) => update("twitterTitle", e.target.value)} placeholder={meta.ogTitle || meta.title || t("twitterTitlePlaceholder")} />
              </div>
              <div className="space-y-2">
                <Label>twitter:description</Label>
                <Textarea value={meta.twitterDescription} onChange={(e) => update("twitterDescription", e.target.value)} placeholder={meta.ogDescription || meta.description || t("twitterDescPlaceholder")} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>twitter:image</Label>
                <Input value={meta.twitterImage} onChange={(e) => update("twitterImage", e.target.value)} placeholder={meta.ogImage || "https://example.com/image.jpg"} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Generated Code */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-lg font-semibold flex items-center gap-2">
              <Code className="w-5 h-5 text-primary" />
              {t("generatedCode")}
            </Label>
            <Button variant="outline" size="sm" onClick={copyAll} disabled={!generatedTags.trim()}>
              {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
              {copied ? t("copied") : t("copyAll")}
            </Button>
          </div>
          <pre className="bg-muted/50 rounded-lg p-4 text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all">
            {generatedTags || t("emptyPreview")}
          </pre>
        </CardContent>
      </Card>

      {/* Preview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Google Preview */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-semibold">{t("googlePreview")}</span>
            </div>
            <div className="space-y-1 p-3 bg-muted/30 rounded-lg">
              <p className="text-sm text-blue-600 dark:text-blue-400 truncate">{previewUrl}</p>
              <p className="text-base text-blue-800 dark:text-blue-300 font-medium truncate">{previewTitle}</p>
              <p className="text-xs text-muted-foreground line-clamp-2">{previewDesc}</p>
            </div>
          </CardContent>
        </Card>

        {/* Facebook Preview */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-3">
              <Facebook className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold">{t("facebookPreview")}</span>
            </div>
            <div className="border rounded-lg overflow-hidden bg-muted/30">
              {meta.ogImage && (
                <div className="w-full h-28 bg-muted flex items-center justify-center">
                  <img src={meta.ogImage} alt="og" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                </div>
              )}
              <div className="p-3 space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase">{new URL(previewUrl).hostname}</p>
                <p className="text-sm font-semibold truncate">{previewTitle}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{previewDesc}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Twitter Preview */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-3">
              <Twitter className="w-4 h-4 text-sky-500" />
              <span className="text-sm font-semibold">{t("twitterPreview")}</span>
            </div>
            <div className="border rounded-xl overflow-hidden bg-muted/30">
              {(meta.twitterImage || meta.ogImage) && (
                <div className="w-full h-28 bg-muted flex items-center justify-center">
                  <img src={meta.twitterImage || meta.ogImage} alt="twitter" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                </div>
              )}
              <div className="p-3 space-y-1">
                <p className="text-sm font-semibold truncate">{meta.twitterTitle || previewTitle}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{meta.twitterDescription || previewDesc}</p>
                <p className="text-[10px] text-muted-foreground">{new URL(previewUrl).hostname}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

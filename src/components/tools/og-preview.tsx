"use client"

import { useState, useMemo } from "react"
import { useTranslations } from "next-intl"
import { Copy, Check, Code, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { GlassCard } from "@/components/ui/glass-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { buildMetaTags, truncate, extractDomain, PLATFORM_LIMITS } from "./og-preview.utils"

interface OgState {
  title: string
  description: string
  image: string
  url: string
  type: string
}

const INITIAL_STATE: OgState = {
  title: "",
  description: "",
  image: "",
  url: "",
  type: "website",
}

const OG_TYPES = ["website", "article", "product", "profile", "video.other"]

function FallbackImage({ alt }: { alt: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
      <ImageIcon className="h-8 w-8 opacity-40" aria-label={alt} />
    </div>
  )
}

function PreviewImage({ src, alt }: { src: string; alt: string }) {
  if (!src) return <FallbackImage alt={alt} />
  return (
    <img
      src={src}
      alt={alt}
      className="h-full w-full object-cover"
      onError={(e) => {
        ;(e.currentTarget as HTMLImageElement).style.visibility = "hidden"
      }}
    />
  )
}

export function OgPreview() {
  const t = useTranslations("OgPreview")
  const [copied, setCopied] = useState(false)
  const [state, setState] = useState<OgState>(INITIAL_STATE)

  const update = (key: keyof OgState, value: string) => {
    setState((prev) => ({ ...prev, [key]: value }))
  }

  const title = state.title || t("placeholderTitle")
  const description = state.description || t("placeholderDescription")
  const domain = extractDomain(state.url) || "example.com"
  const image = state.image

  const metaTags = useMemo(
    () =>
      buildMetaTags({
        title: state.title,
        description: state.description,
        image: state.image,
        url: state.url,
        type: state.type,
      }),
    [state]
  )

  const copyTags = () => {
    if (!metaTags.trim()) return
    navigator.clipboard.writeText(metaTags)
    setCopied(true)
    toast.success(t("copied"))
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Inputs */}
        <GlassCard className="p-6">
          <h2 className="mb-4 text-lg font-semibold">{t("inputsTitle")}</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("titleLabel")}</Label>
              <Input
                value={state.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder={t("titlePlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("descriptionLabel")}</Label>
              <Textarea
                value={state.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder={t("descriptionPlaceholder")}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("imageLabel")}</Label>
              <Input
                value={state.image}
                onChange={(e) => update("image", e.target.value)}
                placeholder="https://example.com/og-image.png"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("urlLabel")}</Label>
                <Input
                  value={state.url}
                  onChange={(e) => update("url", e.target.value)}
                  placeholder="https://example.com/page"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("typeLabel")}</Label>
                <Select value={state.type} onValueChange={(v) => update("type", v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OG_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Meta tags output */}
        <GlassCard className="p-6">
          <div className="mb-3 flex items-center justify-between">
            <Label className="flex items-center gap-2 text-lg font-semibold">
              <Code className="h-5 w-5 text-primary" />
              {t("metaTagsTitle")}
            </Label>
            <Button variant="outline" size="sm" onClick={copyTags} disabled={!metaTags.trim()}>
              {copied ? <Check className="mr-1 h-4 w-4" /> : <Copy className="mr-1 h-4 w-4" />}
              {copied ? t("copied") : t("copy")}
            </Button>
          </div>
          <pre className="max-h-[360px] overflow-auto whitespace-pre-wrap break-all rounded-lg bg-muted/50 p-4 font-mono text-xs">
            {metaTags || t("emptyMeta")}
          </pre>
        </GlassCard>
      </div>

      {/* Live platform previews */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">{t("previewsTitle")}</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Facebook */}
          <GlassCard className="overflow-hidden p-0">
            <div className="border-b border-border/50 px-4 py-2 text-xs font-semibold text-muted-foreground">
              {t("platform.facebook")}
            </div>
            <div className="p-4">
              <div className="overflow-hidden rounded-lg border border-border bg-[#f0f2f5] dark:bg-[#242526]">
                <div className="aspect-[1.91/1] w-full bg-muted">
                  <PreviewImage src={image} alt={title} />
                </div>
                <div className="space-y-1 bg-[#f2f3f5] p-3 dark:bg-[#3a3b3c]">
                  <p className="text-[11px] uppercase tracking-wide text-[#606770] dark:text-[#b0b3b8]">
                    {domain}
                  </p>
                  <p className="text-[15px] font-semibold leading-snug text-[#1d2129] dark:text-[#e4e6eb]">
                    {truncate(title, PLATFORM_LIMITS.facebook.title)}
                  </p>
                  <p className="text-[13px] leading-snug text-[#606770] dark:text-[#b0b3b8]">
                    {truncate(description, PLATFORM_LIMITS.facebook.description)}
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Twitter / X */}
          <GlassCard className="overflow-hidden p-0">
            <div className="border-b border-border/50 px-4 py-2 text-xs font-semibold text-muted-foreground">
              {t("platform.twitter")}
            </div>
            <div className="p-4">
              <div className="overflow-hidden rounded-2xl border border-[#cfd9de] dark:border-[#2f3336]">
                <div className="aspect-[1.91/1] w-full bg-muted">
                  <PreviewImage src={image} alt={title} />
                </div>
                <div className="space-y-0.5 px-3 py-2">
                  <p className="text-[13px] text-[#536471] dark:text-[#8b98a5]">{domain}</p>
                  <p className="text-[15px] font-normal leading-snug text-[#0f1419] dark:text-[#e7e9ea]">
                    {truncate(title, PLATFORM_LIMITS.twitter.title)}
                  </p>
                  <p className="text-[13px] leading-snug text-[#536471] dark:text-[#8b98a5]">
                    {truncate(description, PLATFORM_LIMITS.twitter.description)}
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* LinkedIn */}
          <GlassCard className="overflow-hidden p-0">
            <div className="border-b border-border/50 px-4 py-2 text-xs font-semibold text-muted-foreground">
              {t("platform.linkedin")}
            </div>
            <div className="p-4">
              <div className="overflow-hidden rounded-md border border-[#e0e0e0] bg-white dark:border-[#38434f] dark:bg-[#1b1f23]">
                <div className="aspect-[1.91/1] w-full bg-muted">
                  <PreviewImage src={image} alt={title} />
                </div>
                <div className="space-y-1 p-3">
                  <p className="text-[14px] font-semibold leading-snug text-[#000000e6] dark:text-[#ffffffe6]">
                    {truncate(title, PLATFORM_LIMITS.linkedin.title)}
                  </p>
                  <p className="text-[12px] text-[#00000099] dark:text-[#ffffff99]">{domain}</p>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Discord */}
          <GlassCard className="overflow-hidden p-0">
            <div className="border-b border-border/50 px-4 py-2 text-xs font-semibold text-muted-foreground">
              {t("platform.discord")}
            </div>
            <div className="p-4">
              <div className="rounded border-l-4 border-[#5865f2] bg-[#2b2d31] p-3">
                <p className="mb-1 text-[12px] text-[#dbdee1]/70">{domain}</p>
                <p className="text-[15px] font-semibold leading-snug text-[#00a8fc]">
                  {truncate(title, PLATFORM_LIMITS.discord.title)}
                </p>
                <p className="mt-1 text-[13px] leading-snug text-[#dbdee1]">
                  {truncate(description, PLATFORM_LIMITS.discord.description)}
                </p>
                {image && (
                  <div className="mt-3 aspect-[1.91/1] w-full overflow-hidden rounded bg-muted">
                    <PreviewImage src={image} alt={title} />
                  </div>
                )}
              </div>
            </div>
          </GlassCard>

          {/* Slack */}
          <GlassCard className="overflow-hidden p-0 md:col-span-2">
            <div className="border-b border-border/50 px-4 py-2 text-xs font-semibold text-muted-foreground">
              {t("platform.slack")}
            </div>
            <div className="p-4">
              <div className="flex gap-3 border-l-4 border-[#e0e0e0] pl-3 dark:border-[#383838]">
                <div className="flex-1 space-y-1">
                  <p className="text-[13px] font-bold text-[#1264a3] dark:text-[#1d9bd1]">{domain}</p>
                  <p className="text-[15px] font-bold leading-snug text-[#1d1c1d] dark:text-[#d1d2d3]">
                    {truncate(title, PLATFORM_LIMITS.slack.title)}
                  </p>
                  <p className="text-[13px] leading-snug text-[#1d1c1d]/80 dark:text-[#d1d2d3]/80">
                    {truncate(description, PLATFORM_LIMITS.slack.description)}
                  </p>
                </div>
                {image && (
                  <div className="hidden h-16 w-16 shrink-0 overflow-hidden rounded bg-muted sm:block">
                    <PreviewImage src={image} alt={title} />
                  </div>
                )}
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}

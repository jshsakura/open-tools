import { getTranslations , setRequestLocale} from "next-intl/server"
import { Eye, Code2, Copy } from "lucide-react"
import { ToolPageHeader } from "@/components/tool-page-header"
import { MarkdownPreview } from "@/components/tools/markdown-preview"
import { getToolById } from "@/lib/tools-catalog"
import { cn } from "@/lib/utils"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("MarkdownPreview.title"),
    description: t("MarkdownPreview.description"),
    path: "/tools/markdown-preview",
  })
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export default async function MarkdownPreviewPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale);
    const tool = getToolById("markdown-preview")
  const t = await getTranslations({ locale, namespace: "Catalog" })
  const ui = await getTranslations({ locale, namespace: "MarkdownPreview" })
    const jsonLd = createToolJsonLd({
    locale,
    title: t("MarkdownPreview.title"),
    description: t("MarkdownPreview.description"),
    path: "/tools/markdown-preview",
    category: "DeveloperApplication",
  })

  const features = [
    {
      icon: Eye,
      color: "text-slate-500",
      bg: "bg-slate-500/10",
      title: ui("features.f1.title"),
      desc: ui("features.f1.desc"),
    },
    {
      icon: Code2,
      color: "text-gray-600",
      bg: "bg-gray-500/10",
      title: ui("features.f2.title"),
      desc: ui("features.f2.desc"),
    },
    {
      icon: Copy,
      color: "text-zinc-500",
      bg: "bg-zinc-500/10",
      title: ui("features.f3.title"),
      desc: ui("features.f3.desc"),
    },
  ]

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <ToolPageHeader
        title={t("MarkdownPreview.title")}
        description={t("MarkdownPreview.description")}
        toolId="markdown-preview"
        colorClass={tool?.color}
        center
      />

      <div className="mx-auto mb-12 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="flex items-start gap-3 p-4 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm"
          >
            <div className={cn("shrink-0 p-2 rounded-xl", feature.bg)}>
              <feature.icon className={cn("w-5 h-5", feature.color)} />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">{feature.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                {feature.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      <MarkdownPreview />
    </div>
  )
}

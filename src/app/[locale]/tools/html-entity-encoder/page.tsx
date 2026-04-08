import { getTranslations , setRequestLocale} from "next-intl/server"
import { Braces, Code2, ShieldCheck } from "lucide-react"
import { ToolPageHeader } from "@/components/tool-page-header"
import { HtmlEntityEncoder } from "@/components/tools/html-entity-encoder"
import { getToolById } from "@/lib/tools-catalog"
import { Card, CardContent } from "@/components/ui/card"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"
import { cn } from "@/lib/utils"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("HtmlEntityEncoder.title"),
    description: t("HtmlEntityEncoder.description"),
    path: "/tools/html-entity-encoder",
  })
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export default async function HtmlEntityEncoderPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale);
    const tool = getToolById("html-entity-encoder")
  const t = await getTranslations({ locale, namespace: "HtmlEntityEncoder" })
  const catT = await getTranslations({ locale, namespace: "Catalog" })
    const jsonLd = createToolJsonLd({
    locale,
    title: catT("HtmlEntityEncoder.title"),
    description: catT("HtmlEntityEncoder.description"),
    path: "/tools/html-entity-encoder",
    category: "DeveloperApplication",
  })

  const features = [
    {
      icon: Code2,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      title: t("features.f1.title"),
      desc: t("features.f1.desc"),
    },
    {
      icon: ShieldCheck,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      title: t("features.f2.title"),
      desc: t("features.f2.desc"),
    },
    {
      icon: Braces,
      color: "text-red-500",
      bg: "bg-red-500/10",
      title: t("features.f3.title"),
      desc: t("features.f3.desc"),
    },
  ]

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <ToolPageHeader
        title={catT("HtmlEntityEncoder.title")}
        description={catT("HtmlEntityEncoder.description")}
        toolId="html-entity-encoder"
        colorClass={tool?.color}
        center
      />

      <div className="mx-auto mb-12 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm"
          >
            <div className={cn("shrink-0 rounded-xl p-2", feature.bg)}>
              <feature.icon className={cn("h-5 w-5", feature.color)} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{feature.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{feature.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <HtmlEntityEncoder />
    </div>
  )
}

import { getTranslations, setRequestLocale } from "next-intl/server"
import { Proportions, Calculator, ShieldCheck } from "lucide-react"
import { ToolPageHeader } from "@/components/tool-page-header"
import { AspectRatioCalculator } from "@/components/tools/aspect-ratio-calculator"
import { Card, CardContent } from "@/components/ui/card"
import { getToolById } from "@/lib/tools-catalog"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

const KEYWORDS = [
  "aspect ratio calculator",
  "16:9 calculator",
  "resize ratio",
  "image dimensions",
  "screen ratio",
  "화면 비율 계산기",
  "가로 세로 비율",
  "해상도 계산",
]

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("AspectRatioCalculator.title"),
    description: t("AspectRatioCalculator.description"),
    path: "/tools/aspect-ratio-calculator",
    keywords: KEYWORDS,
  })
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }]
}

export default async function AspectRatioCalculatorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const tool = getToolById("aspect-ratio-calculator")
  const t = await getTranslations({ locale, namespace: "Catalog" })
  const jsonLd = createToolJsonLd({
    locale,
    title: t("AspectRatioCalculator.title"),
    description: t("AspectRatioCalculator.description"),
    path: "/tools/aspect-ratio-calculator",
    category: "DesignApplication",
  })

  const features = [
    {
      icon: Proportions,
      iconColor: "text-sky-500",
      title: t("AspectRatioCalculator.featureRatio"),
      description: t("AspectRatioCalculator.featureRatioDesc"),
    },
    {
      icon: Calculator,
      iconColor: "text-blue-500",
      title: t("AspectRatioCalculator.featureInstant"),
      description: t("AspectRatioCalculator.featureInstantDesc"),
    },
    {
      icon: ShieldCheck,
      iconColor: "text-cyan-500",
      title: t("AspectRatioCalculator.featurePrivate"),
      description: t("AspectRatioCalculator.featurePrivateDesc"),
    },
  ]

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <ToolPageHeader
        title={t("AspectRatioCalculator.title")}
        description={t("AspectRatioCalculator.description")}
        toolId="aspect-ratio-calculator"
        colorClass={tool?.color}
        center
      />

      <div className="mx-auto mb-12 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <Card key={feature.title} className="border-border/50 bg-card/50">
              <CardContent className="pt-6 pb-5">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="p-2 rounded-xl bg-muted/50">
                    <Icon className={`w-6 h-6 ${feature.iconColor}`} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-sm">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <AspectRatioCalculator />
    </div>
  )
}

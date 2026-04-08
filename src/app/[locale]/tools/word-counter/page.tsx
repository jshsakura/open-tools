import { getTranslations , setRequestLocale} from "next-intl/server"
import { Type, Clock, Zap } from "lucide-react"
import { ToolPageHeader } from "@/components/tool-page-header"
import { WordCounter } from "@/components/tools/word-counter"
import { Card, CardContent } from "@/components/ui/card"
import { getToolById } from "@/lib/tools-catalog"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("WordCounter.title"),
    description: t("WordCounter.description"),
    path: "/tools/word-counter",
  })
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export default async function WordCounterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale);
    const tool = getToolById("word-counter")
  const t = await getTranslations({ locale, namespace: "Catalog" })
    const jsonLd = createToolJsonLd({
    locale,
    title: t("WordCounter.title"),
    description: t("WordCounter.description"),
    path: "/tools/word-counter",
    category: "UtilitiesApplication",
  })

  const features = [
    {
      icon: Type,
      iconColor: "text-emerald-500",
      title: t("WordCounter.featureStats"),
      description: t("WordCounter.featureStatsDesc"),
    },
    {
      icon: Clock,
      iconColor: "text-teal-500",
      title: t("WordCounter.featureReadingTime"),
      description: t("WordCounter.featureReadingTimeDesc"),
    },
    {
      icon: Zap,
      iconColor: "text-green-500",
      title: t("WordCounter.featureRealtime"),
      description: t("WordCounter.featureRealtimeDesc"),
    },
  ]

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <ToolPageHeader
        title={t("WordCounter.title")}
        description={t("WordCounter.description")}
        toolId="word-counter"
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

      <WordCounter />
    </div>
  )
}

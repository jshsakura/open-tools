import { getTranslations, setRequestLocale } from "next-intl/server"
import { Database, FileJson, ShieldCheck } from "lucide-react"
import { ToolPageHeader } from "@/components/tool-page-header"
import { MockDataGenerator } from "@/components/tools/mock-data-generator"
import { Card, CardContent } from "@/components/ui/card"
import { getToolById } from "@/lib/tools-catalog"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

const KEYWORDS = [
  "mock data generator",
  "fake data generator",
  "test data generator",
  "dummy data json csv",
  "sample data",
  "더미 데이터 생성기",
  "테스트 데이터",
  "가짜 데이터",
]

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("MockDataGenerator.title"),
    description: t("MockDataGenerator.description"),
    path: "/tools/mock-data-generator",
    keywords: KEYWORDS,
  })
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }]
}

export default async function MockDataGeneratorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const tool = getToolById("mock-data-generator")
  const t = await getTranslations({ locale, namespace: "Catalog" })
  const jsonLd = createToolJsonLd({
    locale,
    title: t("MockDataGenerator.title"),
    description: t("MockDataGenerator.description"),
    path: "/tools/mock-data-generator",
    category: "DeveloperApplication",
  })

  const features = [
    {
      icon: Database,
      iconColor: "text-indigo-500",
      title: t("MockDataGenerator.featureFields"),
      description: t("MockDataGenerator.featureFieldsDesc"),
    },
    {
      icon: FileJson,
      iconColor: "text-blue-500",
      title: t("MockDataGenerator.featureFormat"),
      description: t("MockDataGenerator.featureFormatDesc"),
    },
    {
      icon: ShieldCheck,
      iconColor: "text-violet-500",
      title: t("MockDataGenerator.featurePrivate"),
      description: t("MockDataGenerator.featurePrivateDesc"),
    },
  ]

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <ToolPageHeader
        title={t("MockDataGenerator.title")}
        description={t("MockDataGenerator.description")}
        toolId="mock-data-generator"
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

      <MockDataGenerator />
    </div>
  )
}

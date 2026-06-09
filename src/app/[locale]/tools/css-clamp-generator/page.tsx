import { getTranslations, setRequestLocale } from "next-intl/server"
import { Type, SlidersHorizontal, ShieldCheck } from "lucide-react"
import { ToolPageHeader } from "@/components/tool-page-header"
import { CssClampGenerator } from "@/components/tools/css-clamp-generator"
import { Card, CardContent } from "@/components/ui/card"
import { getToolById } from "@/lib/tools-catalog"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

const KEYWORDS = [
  "css clamp generator",
  "fluid typography",
  "responsive font size",
  "clamp calculator",
  "fluid type scale",
  "반응형 폰트",
  "유체 타이포그래피",
  "CSS clamp 계산기",
]

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("CssClampGenerator.title"),
    description: t("CssClampGenerator.description"),
    path: "/tools/css-clamp-generator",
    keywords: KEYWORDS,
  })
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }]
}

export default async function CssClampGeneratorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const tool = getToolById("css-clamp-generator")
  const t = await getTranslations({ locale, namespace: "Catalog" })
  const jsonLd = createToolJsonLd({
    locale,
    title: t("CssClampGenerator.title"),
    description: t("CssClampGenerator.description"),
    path: "/tools/css-clamp-generator",
    category: "DesignApplication",
  })

  const features = [
    {
      icon: Type,
      iconColor: "text-violet-500",
      title: t("CssClampGenerator.featureFluid"),
      description: t("CssClampGenerator.featureFluidDesc"),
    },
    {
      icon: SlidersHorizontal,
      iconColor: "text-purple-500",
      title: t("CssClampGenerator.featureControl"),
      description: t("CssClampGenerator.featureControlDesc"),
    },
    {
      icon: ShieldCheck,
      iconColor: "text-fuchsia-500",
      title: t("CssClampGenerator.featurePrivate"),
      description: t("CssClampGenerator.featurePrivateDesc"),
    },
  ]

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <ToolPageHeader
        title={t("CssClampGenerator.title")}
        description={t("CssClampGenerator.description")}
        toolId="css-clamp-generator"
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

      <CssClampGenerator />
    </div>
  )
}

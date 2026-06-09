import { getTranslations, setRequestLocale } from "next-intl/server"
import { Contrast, Eye, ShieldCheck } from "lucide-react"
import { ToolPageHeader } from "@/components/tool-page-header"
import { ColorContrastChecker } from "@/components/tools/color-contrast-checker"
import { Card, CardContent } from "@/components/ui/card"
import { getToolById } from "@/lib/tools-catalog"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

const KEYWORDS = [
  "color contrast checker",
  "wcag contrast",
  "accessibility contrast",
  "contrast ratio",
  "aa aaa contrast",
  "색상 대비 검사",
  "명도 대비",
  "웹 접근성",
]

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("ColorContrastChecker.title"),
    description: t("ColorContrastChecker.description"),
    path: "/tools/color-contrast-checker",
    keywords: KEYWORDS,
  })
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }]
}

export default async function ColorContrastCheckerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const tool = getToolById("color-contrast-checker")
  const t = await getTranslations({ locale, namespace: "Catalog" })
  const jsonLd = createToolJsonLd({
    locale,
    title: t("ColorContrastChecker.title"),
    description: t("ColorContrastChecker.description"),
    path: "/tools/color-contrast-checker",
    category: "DesignApplication",
  })

  const features = [
    {
      icon: Contrast,
      iconColor: "text-emerald-500",
      title: t("ColorContrastChecker.featureWcag"),
      description: t("ColorContrastChecker.featureWcagDesc"),
    },
    {
      icon: Eye,
      iconColor: "text-teal-500",
      title: t("ColorContrastChecker.featurePreview"),
      description: t("ColorContrastChecker.featurePreviewDesc"),
    },
    {
      icon: ShieldCheck,
      iconColor: "text-green-500",
      title: t("ColorContrastChecker.featurePrivate"),
      description: t("ColorContrastChecker.featurePrivateDesc"),
    },
  ]

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <ToolPageHeader
        title={t("ColorContrastChecker.title")}
        description={t("ColorContrastChecker.description")}
        toolId="color-contrast-checker"
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

      <ColorContrastChecker />
    </div>
  )
}

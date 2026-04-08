import { getTranslations , setRequestLocale} from "next-intl/server"
import { Palette, Layers, Zap } from "lucide-react"
import { ToolPageHeader } from "@/components/tool-page-header"
import { CssPattern } from "@/components/tools/css-pattern"
import { Card, CardContent } from "@/components/ui/card"
import { getToolById } from "@/lib/tools-catalog"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("CssPattern.title"),
    description: t("CssPattern.description"),
    path: "/tools/css-pattern",
  })
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export default async function CssPatternPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale);
    const tool = getToolById("css-pattern")
  const t = await getTranslations({ locale, namespace: "CssPattern" })
  const catT = await getTranslations({ locale, namespace: "Catalog" })
    const jsonLd = createToolJsonLd({
    locale,
    title: catT("CssPattern.title"),
    description: catT("CssPattern.description"),
    path: "/tools/css-pattern",
    category: "DesignApplication",
  })

  const features = [
    {
      icon: Palette,
      iconColor: "text-orange-500",
      title: t("features.f1.title"),
      description: t("features.f1.desc"),
    },
    {
      icon: Layers,
      iconColor: "text-amber-500",
      title: t("features.f3.title"),
      description: t("features.f3.desc"),
    },
    {
      icon: Zap,
      iconColor: "text-yellow-500",
      title: t("features.f4.title"),
      description: t("features.f4.desc"),
    },
  ]

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <ToolPageHeader
        title={catT("CssPattern.title")}
        description={catT("CssPattern.description")}
        toolId="css-pattern"
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

      <CssPattern />
    </div>
  )
}

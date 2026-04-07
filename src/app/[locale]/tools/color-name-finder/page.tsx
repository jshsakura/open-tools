import { getTranslations } from "next-intl/server"
import { Check, Palette, Zap } from "lucide-react"
import { ToolPageHeader } from "@/components/tool-page-header"
import { ColorNameFinder } from "@/components/tools/color-name-finder"
import { Card, CardContent } from "@/components/ui/card"
import { getToolById } from "@/lib/tools-catalog"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("ColorNameFinder.title"),
    description: t("ColorNameFinder.description"),
    path: "/tools/color-name-finder",
  })
}

export default async function ColorNameFinderPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "ColorNameFinder" })
  const catT = await getTranslations({ locale, namespace: "Catalog" })
  const tool = getToolById("color-name-finder")
  const jsonLd = createToolJsonLd({
    locale,
    title: catT("ColorNameFinder.title"),
    description: catT("ColorNameFinder.description"),
    path: "/tools/color-name-finder",
    category: "DesignApplication",
  })

  const features = [
    {
      icon: Palette,
      iconColor: "text-primary",
      title: t("features.f1.title"),
      description: t("features.f1.desc"),
    },
    {
      icon: Zap,
      iconColor: "text-amber-500",
      title: t("features.f2.title"),
      description: t("features.f2.desc"),
    },
    {
      icon: Check,
      iconColor: "text-emerald-500",
      title: t("features.f4.title"),
      description: t("features.f4.desc"),
    },
  ]

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <ToolPageHeader
        title={catT("ColorNameFinder.title")}
        description={catT("ColorNameFinder.description")}
        icon={tool?.icon}
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
                    <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <ColorNameFinder />
    </div>
  )
}

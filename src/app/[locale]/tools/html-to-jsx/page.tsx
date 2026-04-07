import { getTranslations } from "next-intl/server"
import { FileCode, Wand2, Zap } from "lucide-react"
import { ToolPageHeader } from "@/components/tool-page-header"
import { HtmlToJsx } from "@/components/tools/html-to-jsx"
import { Card, CardContent } from "@/components/ui/card"
import { getToolById } from "@/lib/tools-catalog"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("HtmlToJsx.title"),
    description: t("HtmlToJsx.description"),
    path: "/tools/html-to-jsx",
  })
}

export default async function HtmlToJsxPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "HtmlToJsx" })
  const catT = await getTranslations({ locale, namespace: "Catalog" })
  const tool = getToolById("html-to-jsx")
  const jsonLd = createToolJsonLd({
    locale,
    title: catT("HtmlToJsx.title"),
    description: catT("HtmlToJsx.description"),
    path: "/tools/html-to-jsx",
    category: "DeveloperApplication",
  })

  const features = [
    {
      icon: FileCode,
      iconColor: "text-orange-500",
      title: t("features.f1.title"),
      description: t("features.f1.desc"),
    },
    {
      icon: Wand2,
      iconColor: "text-amber-500",
      title: t("features.f2.title"),
      description: t("features.f2.desc"),
    },
    {
      icon: Zap,
      iconColor: "text-yellow-500",
      title: t("features.f3.title"),
      description: t("features.f3.desc"),
    },
  ]

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <ToolPageHeader
        title={catT("HtmlToJsx.title")}
        description={catT("HtmlToJsx.description")}
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

      <HtmlToJsx />
    </div>
  )
}

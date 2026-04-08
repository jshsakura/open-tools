import { getTranslations , setRequestLocale} from "next-intl/server"
import { CaseSensitive, Zap, Copy } from "lucide-react"
import { ToolPageHeader } from "@/components/tool-page-header"
import { StringCaseConverter } from "@/components/tools/string-case-converter"
import { Card, CardContent } from "@/components/ui/card"
import { getToolById } from "@/lib/tools-catalog"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("StringCaseConverter.title"),
    description: t("StringCaseConverter.description"),
    path: "/tools/string-case-converter",
  })
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export default async function StringCaseConverterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale);
    const tool = getToolById("string-case-converter")
  const t = await getTranslations({ locale, namespace: "Catalog" })
  const ui = await getTranslations({ locale, namespace: "StringCaseConverter" })
    const jsonLd = createToolJsonLd({
    locale,
    title: t("StringCaseConverter.title"),
    description: t("StringCaseConverter.description"),
    path: "/tools/string-case-converter",
    category: "DeveloperApplication",
  })

  const features = [
    {
      icon: CaseSensitive,
      iconColor: "text-indigo-500",
      title: ui("features.f1.title"),
      description: ui("features.f1.desc"),
    },
    {
      icon: Zap,
      iconColor: "text-purple-500",
      title: ui("features.f2.title"),
      description: ui("features.f2.desc"),
    },
    {
      icon: Copy,
      iconColor: "text-violet-500",
      title: ui("features.f3.title"),
      description: ui("features.f3.desc"),
    },
  ]

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <ToolPageHeader
        title={t("StringCaseConverter.title")}
        description={t("StringCaseConverter.description")}
        toolId="string-case-converter"
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

      <StringCaseConverter />
    </div>
  )
}

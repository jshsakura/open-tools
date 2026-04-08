import { getTranslations , setRequestLocale} from "next-intl/server"
import { Play, Radio, Zap } from "lucide-react"
import { ToolPageHeader } from "@/components/tool-page-header"
import { MorseConverter } from "@/components/tools/morse-converter"
import { getToolById } from "@/lib/tools-catalog"
import { Card, CardContent } from "@/components/ui/card"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("MorseConverter.title"),
    description: t("MorseConverter.description"),
    path: "/tools/morse-converter",
  })
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export default async function MorseConverterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale);
    const tool = getToolById("morse-converter")
  const t = await getTranslations({ locale, namespace: "MorseConverter" })
  const catT = await getTranslations({ locale, namespace: "Catalog" })
    const jsonLd = createToolJsonLd({
    locale,
    title: catT("MorseConverter.title"),
    description: catT("MorseConverter.description"),
    path: "/tools/morse-converter",
    category: "UtilitiesApplication",
  })

  const features = [
    {
      icon: Radio,
      iconColor: "text-rose-500",
      title: t("features.f1.title"),
      description: t("features.f1.desc"),
    },
    {
      icon: Play,
      iconColor: "text-pink-500",
      title: t("features.f2.title"),
      description: t("features.f2.desc"),
    },
    {
      icon: Zap,
      iconColor: "text-red-500",
      title: t("features.f4.title"),
      description: t("features.f4.desc"),
    },
  ]

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <ToolPageHeader
        title={catT("MorseConverter.title")}
        description={catT("MorseConverter.description")}
        toolId="morse-converter"
        colorClass={tool?.color}
        center
      />

      <div className="mx-auto mb-12 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <Card key={feature.title} className="border-border/50 bg-card/50">
              <CardContent className="pb-5 pt-6">
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="rounded-xl bg-muted/50 p-2">
                    <Icon className={`h-6 w-6 ${feature.iconColor}`} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold">{feature.title}</h3>
                    <p className="text-xs leading-relaxed text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <MorseConverter />
    </div>
  )
}

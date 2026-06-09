import { getTranslations, setRequestLocale } from "next-intl/server"
import { Hash, ArrowRightLeft, ShieldCheck } from "lucide-react"
import { ToolPageHeader } from "@/components/tool-page-header"
import { RomanNumeralConverter } from "@/components/tools/roman-numeral-converter"
import { Card, CardContent } from "@/components/ui/card"
import { getToolById } from "@/lib/tools-catalog"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

const KEYWORDS = [
  "roman numeral converter",
  "number to roman numerals",
  "roman numerals to number",
  "roman numeral translator",
  "로마 숫자 변환기",
  "로마자 숫자",
  "숫자 로마 변환",
]

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("RomanNumeralConverter.title"),
    description: t("RomanNumeralConverter.description"),
    path: "/tools/roman-numeral-converter",
    keywords: KEYWORDS,
  })
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }]
}

export default async function RomanNumeralConverterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const tool = getToolById("roman-numeral-converter")
  const t = await getTranslations({ locale, namespace: "Catalog" })
  const jsonLd = createToolJsonLd({
    locale,
    title: t("RomanNumeralConverter.title"),
    description: t("RomanNumeralConverter.description"),
    path: "/tools/roman-numeral-converter",
    category: "UtilitiesApplication",
  })

  const features = [
    {
      icon: ArrowRightLeft,
      iconColor: "text-amber-500",
      title: t("RomanNumeralConverter.featureBidirectional"),
      description: t("RomanNumeralConverter.featureBidirectionalDesc"),
    },
    {
      icon: Hash,
      iconColor: "text-orange-500",
      title: t("RomanNumeralConverter.featureRange"),
      description: t("RomanNumeralConverter.featureRangeDesc"),
    },
    {
      icon: ShieldCheck,
      iconColor: "text-yellow-500",
      title: t("RomanNumeralConverter.featurePrivate"),
      description: t("RomanNumeralConverter.featurePrivateDesc"),
    },
  ]

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <ToolPageHeader
        title={t("RomanNumeralConverter.title")}
        description={t("RomanNumeralConverter.description")}
        toolId="roman-numeral-converter"
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

      <RomanNumeralConverter />
    </div>
  )
}

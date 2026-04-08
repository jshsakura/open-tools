import { getTranslations , setRequestLocale} from "next-intl/server"
import { Hash, ArrowLeftRight, Zap } from "lucide-react"
import { ToolPageHeader } from "@/components/tool-page-header"
import { NumberBaseConverter } from "@/components/tools/number-base-converter"
import { getToolById } from "@/lib/tools-catalog"
import { cn } from "@/lib/utils"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("NumberBaseConverter.title"),
    description: t("NumberBaseConverter.description"),
    path: "/tools/number-base-converter",
  })
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export default async function NumberBaseConverterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale);
    const tool = getToolById("number-base-converter")
  const t = await getTranslations({ locale, namespace: "Catalog" })
  const ui = await getTranslations({ locale, namespace: "NumberBaseConverter" })
    const jsonLd = createToolJsonLd({
    locale,
    title: t("NumberBaseConverter.title"),
    description: t("NumberBaseConverter.description"),
    path: "/tools/number-base-converter",
    category: "DeveloperApplication",
  })

  const features = [
    {
      icon: Hash,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      title: ui("features.f1.title"),
      desc: ui("features.f1.desc"),
    },
    {
      icon: ArrowLeftRight,
      color: "text-violet-500",
      bg: "bg-violet-500/10",
      title: ui("features.f2.title"),
      desc: ui("features.f2.desc"),
    },
    {
      icon: Zap,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
      title: ui("features.f3.title"),
      desc: ui("features.f3.desc"),
    },
  ]

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <ToolPageHeader
        title={t("NumberBaseConverter.title")}
        description={t("NumberBaseConverter.description")}
        toolId="number-base-converter"
        colorClass={tool?.color}
        center
      />

      <div className="mx-auto max-w-5xl space-y-12">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm"
            >
              <div className={cn("shrink-0 rounded-xl p-2", feature.bg)}>
                <feature.icon className={cn("h-5 w-5", feature.color)} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{feature.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <NumberBaseConverter />
      </div>
    </div>
  )
}

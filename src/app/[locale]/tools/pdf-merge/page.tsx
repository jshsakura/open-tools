import { getTranslations , setRequestLocale} from "next-intl/server"
import { ShieldCheck, Infinity as InfinityIcon, SortAsc, Files } from "lucide-react"
import { ToolGuide } from "@/components/tool-guide-section"
import { ToolPageHeader } from "@/components/tool-page-header"
import { PdfMerge } from "@/components/tools/pdf-merge"
import { getToolById } from "@/lib/tools-catalog"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("PdfMerge.title"),
    description: t("PdfMerge.description"),
    path: "/tools/pdf-merge",
  })
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export default async function PdfMergePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale);
    const tool = getToolById("pdf-merge")
  const t = await getTranslations({ locale, namespace: "PdfMerge" })
  const catT = await getTranslations({ locale, namespace: "Catalog" })
    const jsonLd = createToolJsonLd({
    locale,
    title: catT("PdfMerge.title"),
    description: catT("PdfMerge.description"),
    path: "/tools/pdf-merge",
    category: "UtilitiesApplication",
  })

  const features = [
    {
      icon: InfinityIcon,
      color: "text-red-500",
      bg: "bg-red-500/10",
      title: t("features.f1.title"),
      description: t("features.f1.desc"),
    },
    {
      icon: SortAsc,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      title: t("features.f2.title"),
      description: t("features.f2.desc"),
    },
    {
      icon: ShieldCheck,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      title: t("features.f3.title"),
      description: t("features.f3.desc"),
    },
  ]

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <ToolPageHeader
        title={catT("PdfMerge.title")}
        description={catT("PdfMerge.description")}
        toolId="pdf-merge"
        colorClass={tool?.color ?? "text-red-500"}
        center
      />

      <div className="mx-auto max-w-5xl space-y-12">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm">
              <div className={`shrink-0 rounded-xl p-2 ${feature.bg}`}>
                <feature.icon className={`h-5 w-5 ${feature.color}`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{feature.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        <PdfMerge />
        <ToolGuide ns="PdfMerge" />
      </div>
    </div>
  )
}

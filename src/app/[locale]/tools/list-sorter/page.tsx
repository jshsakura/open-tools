import { getTranslations , setRequestLocale} from "next-intl/server"
import { Layers, ListFilter, Zap } from "lucide-react"
import { ToolPageHeader } from "@/components/tool-page-header"
import { ListSorter } from "@/components/tools/list-sorter"
import { getToolById } from "@/lib/tools-catalog"
import { Card, CardContent } from "@/components/ui/card"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("ListSorter.title"),
    description: t("ListSorter.description"),
    path: "/tools/list-sorter",
  })
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export default async function ListSorterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale);
    const tool = getToolById("list-sorter")
  const t = await getTranslations({ locale, namespace: "ListSorter" })
  const catT = await getTranslations({ locale, namespace: "Catalog" })
    const jsonLd = createToolJsonLd({
    locale,
    title: catT("ListSorter.title"),
    description: catT("ListSorter.description"),
    path: "/tools/list-sorter",
    category: "UtilitiesApplication",
  })

  const features = [
    {
      icon: ListFilter,
      iconColor: "text-sky-500",
      title: t("features.f1.title"),
      description: t("features.f1.desc"),
    },
    {
      icon: Layers,
      iconColor: "text-amber-500",
      title: t("features.f2.title"),
      description: t("features.f2.desc"),
    },
    {
      icon: Zap,
      iconColor: "text-emerald-500",
      title: t("features.f4.title"),
      description: t("features.f4.desc"),
    },
  ]

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <ToolPageHeader
        title={catT("ListSorter.title")}
        description={catT("ListSorter.description")}
        toolId="list-sorter"
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

      <ListSorter />
    </div>
  )
}

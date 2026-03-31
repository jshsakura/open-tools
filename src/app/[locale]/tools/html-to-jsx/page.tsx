"use client"

import dynamic from "next/dynamic"
import { useTranslations } from "next-intl"
import { FileCode, Wand2, Zap } from "lucide-react"
import { ToolLoadingSkeleton } from "@/components/tool-loader"
import { ToolPageHeader } from "@/components/tool-page-header"
import { getToolById } from "@/lib/tools-catalog"
import { Card, CardContent } from "@/components/ui/card"

const HtmlToJsx = dynamic(
  () => import("@/components/tools/html-to-jsx").then((m) => ({ default: m.HtmlToJsx })),
  { loading: () => <ToolLoadingSkeleton />, ssr: false }
)

export default function HtmlToJsxPage() {
  const t = useTranslations("HtmlToJsx")
  const catT = useTranslations("Catalog")
  const tool = getToolById("html-to-jsx")

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

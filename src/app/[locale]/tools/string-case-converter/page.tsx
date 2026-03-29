"use client"

import dynamic from "next/dynamic"
import { useTranslations } from "next-intl"
import { CaseSensitive, Zap, Copy } from "lucide-react"
import { ToolLoadingSkeleton } from "@/components/tool-loader"
import { ToolPageHeader } from "@/components/tool-page-header"
import { getToolById } from "@/lib/tools-catalog"
import { Card, CardContent } from "@/components/ui/card"

const StringCaseConverter = dynamic(
  () =>
    import("@/components/tools/string-case-converter").then((m) => ({
      default: m.StringCaseConverter,
    })),
  { loading: () => <ToolLoadingSkeleton />, ssr: false }
)

const features = [
  {
    icon: CaseSensitive,
    iconColor: "text-indigo-500",
    title: "12 Case Formats",
    description: "All common naming conventions covered",
  },
  {
    icon: Zap,
    iconColor: "text-purple-500",
    title: "Instant Convert",
    description: "All formats generated simultaneously",
  },
  {
    icon: Copy,
    iconColor: "text-violet-500",
    title: "One-click Copy",
    description: "Copy any format individually",
  },
]

export default function StringCaseConverterPage() {
  const t = useTranslations("Catalog")
  const tool = getToolById("string-case-converter")

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl"><ToolPageHeader
      title={t("StringCaseConverter.title")}
      description={t("StringCaseConverter.description")}
      icon={tool?.icon}
      colorClass={tool?.color}
      center
    />
    
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
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
    
    <StringCaseConverter /></div>
  )
}

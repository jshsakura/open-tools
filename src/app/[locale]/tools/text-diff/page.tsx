"use client"

import dynamic from "next/dynamic"
import { useTranslations } from "next-intl"
import { GitCompareArrows, Plus, BarChart2 } from "lucide-react"
import { ToolLoadingSkeleton } from "@/components/tool-loader"
import { ToolPageHeader } from "@/components/tool-page-header"
import { getToolById } from "@/lib/tools-catalog"
import { Card, CardContent } from "@/components/ui/card"

const TextDiff = dynamic(
  () => import("@/components/tools/text-diff").then((m) => ({ default: m.TextDiff })),
  { loading: () => <ToolLoadingSkeleton />, ssr: false }
)

const features = [
  {
    icon: GitCompareArrows,
    iconColor: "text-orange-500",
    title: "Line & Word Diff",
    description: "Toggle between line-level and word-level comparison",
  },
  {
    icon: Plus,
    iconColor: "text-green-500",
    title: "Visual Highlights",
    description: "Added lines in green, removed in red",
  },
  {
    icon: BarChart2,
    iconColor: "text-blue-500",
    title: "Change Stats",
    description: "See exactly how many lines changed",
  },
]

export default function TextDiffPage() {
  const t = useTranslations("Catalog")
  const tool = getToolById("text-diff")

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl"><ToolPageHeader
      title={t("TextDiff.title")}
      description={t("TextDiff.description")}
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
    
    <TextDiff /></div>
  )
}

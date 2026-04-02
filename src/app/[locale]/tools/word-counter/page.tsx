"use client"

import dynamic from "next/dynamic"
import { useTranslations } from "next-intl"
import { Type, Clock, Zap } from "lucide-react"
import { ToolLoadingSkeleton } from "@/components/tool-loader"
import { ToolPageHeader } from "@/components/tool-page-header"
import { getToolById } from "@/lib/tools-catalog"
import { Card, CardContent } from "@/components/ui/card"

const WordCounter = dynamic(
  () => import("@/components/tools/word-counter").then((m) => ({ default: m.WordCounter })),
  { loading: () => <ToolLoadingSkeleton />, ssr: false }
)

export default function WordCounterPage() {
  const t = useTranslations("Catalog")
  const tool = getToolById("word-counter")

  const features = [
    {
      icon: Type,
      iconColor: "text-emerald-500",
      title: t("WordCounter.featureStats"),
      description: t("WordCounter.featureStatsDesc"),
    },
    {
      icon: Clock,
      iconColor: "text-teal-500",
      title: t("WordCounter.featureReadingTime"),
      description: t("WordCounter.featureReadingTimeDesc"),
    },
    {
      icon: Zap,
      iconColor: "text-green-500",
      title: t("WordCounter.featureRealtime"),
      description: t("WordCounter.featureRealtimeDesc"),
    },
  ]

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl"><ToolPageHeader
      title={t("WordCounter.title")}
      description={t("WordCounter.description")}
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
    
    <WordCounter /></div>
  )
}

"use client"

import dynamic from "next/dynamic"
import { useTranslations } from "next-intl"
import { KeyRound, ShieldCheck, Zap } from "lucide-react"
import { ToolLoadingSkeleton } from "@/components/tool-loader"
import { ToolPageHeader } from "@/components/tool-page-header"
import { getToolById } from "@/lib/tools-catalog"
import { Card, CardContent } from "@/components/ui/card"

const PassphraseGenerator = dynamic(
  () => import("@/components/tools/passphrase-generator").then((m) => ({ default: m.PassphraseGenerator })),
  { loading: () => <ToolLoadingSkeleton />, ssr: false }
)

export default function PassphraseGeneratorPage() {
  const t = useTranslations("PassphraseGenerator")
  const catT = useTranslations("Catalog")
  const tool = getToolById("passphrase-generator")

  const features = [
    {
      icon: ShieldCheck,
      iconColor: "text-emerald-500",
      title: t("features.f1.title"),
      description: t("features.f1.desc"),
    },
    {
      icon: KeyRound,
      iconColor: "text-blue-500",
      title: t("features.f2.title"),
      description: t("features.f2.desc"),
    },
    {
      icon: Zap,
      iconColor: "text-amber-500",
      title: t("features.f4.title"),
      description: t("features.f4.desc"),
    },
  ]

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <ToolPageHeader
        title={catT("PassphraseGenerator.title")}
        description={catT("PassphraseGenerator.description")}
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
      
      <PassphraseGenerator />
    </div>
  )
}

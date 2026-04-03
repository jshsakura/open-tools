"use client"

import dynamic from "next/dynamic"
import { useTranslations } from "next-intl"
import { ToolGuide } from "@/components/tool-guide-section"
import { ToolLoadingSkeleton } from "@/components/tool-loader"
import { ToolPageHeader } from "@/components/tool-page-header"
import { getToolById } from "@/lib/tools-catalog"

const TipCalculatorTool = dynamic(
  () => import("@/components/tools/tip-calculator").then((m) => ({ default: m.TipCalculatorTool })),
  { loading: () => <ToolLoadingSkeleton />, ssr: false },
)

export default function TipCalculatorPage() {
  const t = useTranslations("Catalog")
  const tool = getToolById("tip-calculator")

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <ToolPageHeader title={t("TipCalculator.title")} description={t("TipCalculator.description")} icon={tool?.icon} colorClass={tool?.color} center />
      <TipCalculatorTool />
      <ToolGuide ns="TipCalculator" />
    </div>
  )
}

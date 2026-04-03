"use client"

import dynamic from "next/dynamic"
import { useTranslations } from "next-intl"
import { ToolGuide } from "@/components/tool-guide-section"
import { ToolLoadingSkeleton } from "@/components/tool-loader"
import { ToolPageHeader } from "@/components/tool-page-header"
import { getToolById } from "@/lib/tools-catalog"

const AgeCalculatorTool = dynamic(
  () => import("@/components/tools/age-calculator").then((m) => ({ default: m.AgeCalculatorTool })),
  { loading: () => <ToolLoadingSkeleton />, ssr: false },
)

export default function AgeCalculatorPage() {
  const t = useTranslations("Catalog")
  const tool = getToolById("age-calculator")

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <ToolPageHeader title={t("AgeCalculator.title")} description={t("AgeCalculator.description")} icon={tool?.icon} colorClass={tool?.color} center />
      <AgeCalculatorTool />
      <ToolGuide ns="AgeCalculator" />
    </div>
  )
}

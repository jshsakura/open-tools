"use client"

import dynamic from "next/dynamic"
import { useTranslations } from "next-intl"
import { ToolGuide } from "@/components/tool-guide-section"
import { ToolLoadingSkeleton } from "@/components/tool-loader"
import { ToolPageHeader } from "@/components/tool-page-header"
import { getToolById } from "@/lib/tools-catalog"

const DateCalculatorTool = dynamic(
  () => import("@/components/tools/date-calculator").then((m) => ({ default: m.DateCalculatorTool })),
  { loading: () => <ToolLoadingSkeleton />, ssr: false },
)

export default function DateCalculatorPage() {
  const t = useTranslations("Catalog")
  const tool = getToolById("date-calculator")

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <ToolPageHeader title={t("DateCalculator.title")} description={t("DateCalculator.description")} icon={tool?.icon} colorClass={tool?.color} center />
      <DateCalculatorTool />
      <ToolGuide ns="DateCalculator" />
    </div>
  )
}

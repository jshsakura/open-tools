"use client"

import dynamic from "next/dynamic"
import { useTranslations } from "next-intl"
import { ToolGuide } from "@/components/tool-guide-section"
import { ToolLoadingSkeleton } from "@/components/tool-loader"
import { ToolPageHeader } from "@/components/tool-page-header"
import { getToolById } from "@/lib/tools-catalog"

const RandomPickerTool = dynamic(
  () => import("@/components/tools/random-picker").then((m) => ({ default: m.RandomPickerTool })),
  { loading: () => <ToolLoadingSkeleton />, ssr: false },
)

export default function RandomPickerPage() {
  const t = useTranslations("Catalog")
  const tool = getToolById("random-picker")

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <ToolPageHeader title={t("RandomPicker.title")} description={t("RandomPicker.description")} icon={tool?.icon} colorClass={tool?.color} center />
      <RandomPickerTool />
      <ToolGuide ns="RandomPicker" />
    </div>
  )
}

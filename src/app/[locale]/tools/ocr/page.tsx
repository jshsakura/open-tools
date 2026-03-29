"use client"

import dynamic from "next/dynamic"
import { useTranslations } from "next-intl"
import { ToolLoadingSkeleton } from "@/components/tool-loader"
import { ToolPageHeader } from "@/components/tool-page-header"
import { getToolById } from "@/lib/tools-catalog"
import { ScanText } from "lucide-react"

const OcrTool = dynamic(
    () => import("@/components/tools/text-tools/ocr-tool").then(mod => ({ default: mod.OcrTool })),
    {
        loading: () => <ToolLoadingSkeleton />,
        ssr: false,
    }
)

export default function OcrPage() {
    const t = useTranslations("Catalog")
    const tool = getToolById("ocr")

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl"><ToolPageHeader
            title={t("OcrTool.title")}
            description={t("OcrTool.description")}
            icon={tool?.icon ?? ScanText}
            colorClass={tool?.color ?? "text-blue-500"}
        />
        <OcrTool /></div>
    )
}

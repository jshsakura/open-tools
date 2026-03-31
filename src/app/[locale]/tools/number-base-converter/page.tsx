"use client"

import dynamic from "next/dynamic"
import { useTranslations } from "next-intl"
import { Hash, ArrowLeftRight, Zap } from "lucide-react"
import { ToolLoadingSkeleton } from "@/components/tool-loader"
import { ToolPageHeader } from "@/components/tool-page-header"
import { getToolById } from "@/lib/tools-catalog"
import { cn } from "@/lib/utils"

const NumberBaseConverterTool = dynamic(
  () =>
    import("@/components/tools/number-base-converter").then((m) => ({
      default: m.NumberBaseConverter,
    })),
  { loading: () => <ToolLoadingSkeleton />, ssr: false }
)

const features = [
  {
    icon: Hash,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    title: "4 Number Bases",
    desc: "Binary, Octal, Decimal, Hexadecimal",
  },
  {
    icon: ArrowLeftRight,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    title: "Any Direction",
    desc: "Edit any field to convert all others instantly",
  },
  {
    icon: Zap,
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
    title: "BigInt Support",
    desc: "Handles large 64-bit integers accurately",
  },
]

export default function NumberBaseConverterPage() {
  const t = useTranslations("Catalog")
  const tool = getToolById("number-base-converter")

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <ToolPageHeader
        title={t("NumberBaseConverter.title")}
        description={t("NumberBaseConverter.description")}
        icon={tool?.icon}
        colorClass={tool?.color}
        center
      />

      <div className="mx-auto max-w-5xl space-y-12">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm"
            >
              <div className={cn("shrink-0 rounded-xl p-2", f.bg)}>
                <f.icon className={cn("h-5 w-5", f.color)} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{f.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <NumberBaseConverterTool />
      </div>
    </div>
  )
}

"use client"

import dynamic from "next/dynamic"
import { useTranslations } from "next-intl"
import { Code2, ShieldCheck, Braces } from "lucide-react"
import { ToolLoadingSkeleton } from "@/components/tool-loader"
import { ToolPageHeader } from "@/components/tool-page-header"
import { getToolById } from "@/lib/tools-catalog"
import { cn } from "@/lib/utils"

const HtmlEntityEncoderTool = dynamic(
  () =>
    import("@/components/tools/html-entity-encoder").then((m) => ({
      default: m.HtmlEntityEncoder,
    })),
  { loading: () => <ToolLoadingSkeleton />, ssr: false }
)

const features = [
  {
    icon: Code2,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    title: "Encode & Decode",
    desc: "Bidirectional HTML entity conversion",
  },
  {
    icon: ShieldCheck,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    title: "XSS Prevention",
    desc: "Encode untrusted content before rendering",
  },
  {
    icon: Braces,
    color: "text-red-500",
    bg: "bg-red-500/10",
    title: "Named & Numeric",
    desc: "Supports &amp; and &#38; formats",
  },
]

export default function HtmlEntityEncoderPage() {
  const t = useTranslations("Catalog")
  const tool = getToolById("html-entity-encoder")

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl"><ToolPageHeader
      title={t("HtmlEntityEncoder.title")}
      description={t("HtmlEntityEncoder.description")}
      icon={tool?.icon}
      colorClass={tool?.color}
      center
    />
    
      <div className="mx-auto mb-12 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-3">
      {features.map((f) => (
        <div
          key={f.title}
          className="flex items-start gap-3 p-4 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm"
        >
          <div className={cn("shrink-0 p-2 rounded-xl", f.bg)}>
            <f.icon className={cn("w-5 h-5", f.color)} />
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">{f.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              {f.desc}
            </p>
          </div>
        </div>
      ))}
    </div>
    
    <HtmlEntityEncoderTool /></div>
  )
}

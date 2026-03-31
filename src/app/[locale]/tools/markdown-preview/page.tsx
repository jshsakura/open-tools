"use client"

import dynamic from "next/dynamic"
import { useTranslations } from "next-intl"
import { Eye, Code2, Copy } from "lucide-react"
import { ToolLoadingSkeleton } from "@/components/tool-loader"
import { ToolPageHeader } from "@/components/tool-page-header"
import { getToolById } from "@/lib/tools-catalog"
import { cn } from "@/lib/utils"

const MarkdownPreviewTool = dynamic(
  () =>
    import("@/components/tools/markdown-preview").then((m) => ({
      default: m.MarkdownPreview,
    })),
  { loading: () => <ToolLoadingSkeleton />, ssr: false }
)

const features = [
  {
    icon: Eye,
    color: "text-slate-500",
    bg: "bg-slate-500/10",
    title: "Live Preview",
    desc: "Markdown renders instantly as you type",
  },
  {
    icon: Code2,
    color: "text-gray-600",
    bg: "bg-gray-500/10",
    title: "Basic Syntax",
    desc: "Headers, bold, italic, lists, code blocks, links",
  },
  {
    icon: Copy,
    color: "text-zinc-500",
    bg: "bg-zinc-500/10",
    title: "Export HTML",
    desc: "Copy rendered HTML output directly",
  },
]

export default function MarkdownPreviewPage() {
  const t = useTranslations("Catalog")
  const tool = getToolById("markdown-preview")

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl"><ToolPageHeader
      title={t("MarkdownPreview.title")}
      description={t("MarkdownPreview.description")}
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
    
    <MarkdownPreviewTool /></div>
  )
}

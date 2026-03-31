"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { ToolLoadingSkeleton } from "@/components/tool-loader";
import { ToolPageHeader } from "@/components/tool-page-header";
import { ToolGuide } from "@/components/tool-guide-section";
import { getToolById } from "@/lib/tools-catalog";
import { Files, ShieldCheck, Infinity as InfinityIcon, SortAsc } from "lucide-react";

const PdfMerge = dynamic(
  () =>
    import("@/components/tools/pdf-merge").then((mod) => ({
      default: mod.PdfMerge,
    })),
  {
    loading: () => <ToolLoadingSkeleton />,
    ssr: false,
  },
);

export default function PdfMergePage() {
  const t = useTranslations("Catalog");
  const tool = getToolById("pdf-merge");

  const features = [
    {
      icon: InfinityIcon,
      color: "text-red-500",
      bg: "bg-red-500/10",
      title: "파일 수 제한 없음",
      titleEn: "No File Limit",
      desc: "합칠 PDF 파일 수에 제한이 없습니다.",
      descEn: "Merge as many PDF files as you need at once.",
    },
    {
      icon: SortAsc,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      title: "순서 조정",
      titleEn: "Reorder Pages",
      desc: "드래그로 파일 순서를 자유롭게 변경하세요.",
      descEn: "Drag and drop to reorder files before merging.",
    },
    {
      icon: ShieldCheck,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      title: "완전 로컬 처리",
      titleEn: "100% Local",
      desc: "파일이 서버에 업로드되지 않습니다.",
      descEn: "Files never leave your browser. Private & secure.",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <ToolPageHeader
        title={t("PdfMerge.title")}
        description={t("PdfMerge.description")}
        icon={tool?.icon ?? Files}
        colorClass={tool?.color ?? "text-red-500"}
        center
      />

      <div className="mx-auto max-w-5xl space-y-12">
        {/* Feature Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.titleEn}
              className="flex items-start gap-3 p-4 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm"
            >
              <div className={`shrink-0 p-2 rounded-xl ${f.bg}`}>
                <f.icon className={`w-5 h-5 ${f.color}`} />
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

        <PdfMerge />
        <ToolGuide ns="PdfMerge" />
      </div>
    </div>
  );
}

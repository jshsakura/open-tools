"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { ToolGuide } from "@/components/tool-guide-section";
import { ToolLoadingSkeleton } from "@/components/tool-loader";
import { ToolPageHeader } from "@/components/tool-page-header";
import { getToolById } from "@/lib/tools-catalog";

const SeoAnalyzerTool = dynamic(
  () => import("@/components/tools/seo-analyzer").then((mod) => ({ default: mod.SeoAnalyzerTool })),
  { loading: () => <ToolLoadingSkeleton />, ssr: false },
);

export default function SeoAnalyzerPage() {
  const t = useTranslations("SeoAnalyzer");
  const tool = getToolById("seo-analyzer");

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      {tool ? (
        <ToolPageHeader
          title={t("title")}
          description={t("description")}
          icon={tool.icon}
          colorClass={tool.color}
        />
      ) : null}
      <SeoAnalyzerTool />
      <ToolGuide ns="SeoAnalyzer" />
    </div>
  );
}

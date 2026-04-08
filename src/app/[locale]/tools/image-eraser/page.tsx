import { getTranslations, setRequestLocale } from "next-intl/server";
import { ImageEraser } from '@/components/tools/image-eraser';
import { ToolGuide } from '@/components/tool-guide-section'
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"
import { getToolById } from "@/lib/tools-catalog"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "Catalog" });
    return createToolMetadata({
        locale,
        title: t("ImageEraser.title"),
        description: t("ImageEraser.description"),
        path: "/tools/image-eraser",
    });
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export default async function ImageEraserPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const tc = await getTranslations({ locale, namespace: "Catalog" });
    ;
    const jsonLd = createToolJsonLd({
        locale,
        title: tc("ImageEraser.title"),
        description: tc("ImageEraser.description"),
        path: "/tools/image-eraser",
        category: "MultimediaApplication",
    });

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            <ImageEraser />
            <ToolGuide ns="ImageEraser" />
        </div>
    );
}

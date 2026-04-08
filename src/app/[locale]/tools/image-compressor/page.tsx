import { getTranslations, setRequestLocale } from "next-intl/server";
import { ImageCompressor } from '@/components/tools/image-compressor';
import { ToolGuide } from "@/components/tool-guide-section";
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"
import { getToolById } from "@/lib/tools-catalog"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "Catalog" });
    return createToolMetadata({
        locale,
        title: t("ImageCompressor.title"),
        description: t("ImageCompressor.description"),
        path: "/tools/image-compressor",
    });
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export default async function ImageCompressorPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const tc = await getTranslations({ locale, namespace: "Catalog" });
    ;
    const jsonLd = createToolJsonLd({
        locale,
        title: tc("ImageCompressor.title"),
        description: tc("ImageCompressor.description"),
        path: "/tools/image-compressor",
        category: "MultimediaApplication",
    });

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            <ImageCompressor />
            <ToolGuide ns="ImageCompressor" />
        </div>
    );
}

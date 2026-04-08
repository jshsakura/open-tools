import { getTranslations, setRequestLocale } from "next-intl/server";
import { ImageWatermark } from '@/components/tools/image-watermark';
import { ToolGuide } from "@/components/tool-guide-section";
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"
import { getToolById } from "@/lib/tools-catalog"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "Catalog" });
    return createToolMetadata({
        locale,
        title: t("ImageWatermark.title"),
        description: t("ImageWatermark.description"),
        path: "/tools/image-watermark",
    });
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export default async function ImageWatermarkPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const tc = await getTranslations({ locale, namespace: "Catalog" });
    ;
    const jsonLd = createToolJsonLd({
        locale,
        title: tc("ImageWatermark.title"),
        description: tc("ImageWatermark.description"),
        path: "/tools/image-watermark",
        category: "MultimediaApplication",
    });

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            <ImageWatermark />
            <ToolGuide ns="ImageWatermark" />
        </div>
    );
}

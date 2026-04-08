import { getTranslations, setRequestLocale } from "next-intl/server";
import { ImageFilters } from '@/components/tools/image-filters';
import { ToolGuide } from "@/components/tool-guide-section";
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"
import { getToolById } from "@/lib/tools-catalog"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "Catalog" });
    return createToolMetadata({
        locale,
        title: t("ImageFilters.title"),
        description: t("ImageFilters.description"),
        path: "/tools/image-filters",
    });
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export default async function ImageFiltersPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const tc = await getTranslations({ locale, namespace: "Catalog" });
    ;
    const jsonLd = createToolJsonLd({
        locale,
        title: tc("ImageFilters.title"),
        description: tc("ImageFilters.description"),
        path: "/tools/image-filters",
        category: "MultimediaApplication",
    });

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            <ImageFilters />
            <ToolGuide ns="ImageFilters" />
        </div>
    );
}

import { getTranslations, setRequestLocale } from "next-intl/server";
import { ColorPicker } from '@/components/tools/color-picker';
import { ToolGuide } from "@/components/tool-guide-section";
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"
import { getToolById } from "@/lib/tools-catalog"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;

    const t = await getTranslations({ locale, namespace: "Catalog" });
    return createToolMetadata({
        locale,
        title: t("ColorPicker.title"),
        description: t("ColorPicker.description"),
        path: "/tools/color-picker",
    });
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export default async function ColorPickerPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
  setRequestLocale(locale);
    const tc = await getTranslations({ locale, namespace: "Catalog" });
    ;
    const jsonLd = createToolJsonLd({
        locale,
        title: tc("ColorPicker.title"),
        description: tc("ColorPicker.description"),
        path: "/tools/color-picker",
        category: "DesignApplication",
    });

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            <ColorPicker />
            <ToolGuide ns="ColorPicker" />
        </div>
    );
}

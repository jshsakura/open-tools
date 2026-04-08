import { BcryptGenerator } from "@/components/tools/bcrypt-generator"
import { ToolGuide } from "@/components/tool-guide-section"
import { getTranslations , setRequestLocale} from "next-intl/server"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"
import { getToolById } from "@/lib/tools-catalog"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;

    const t = await getTranslations({ locale, namespace: "Catalog" });
    return createToolMetadata({
        locale,
        title: t("BcryptGenerator.title"),
        description: t("BcryptGenerator.description"),
        path: "/tools/bcrypt-generator",
    })
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export default async function BcryptGeneratorPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
  setRequestLocale(locale);
    const tc = await getTranslations({ locale, namespace: "Catalog" });
    ;
    const jsonLd = createToolJsonLd({
        locale,
        title: tc("BcryptGenerator.title"),
        description: tc("BcryptGenerator.description"),
        path: "/tools/bcrypt-generator",
        category: "SecurityApplication",
    });

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            <BcryptGenerator />
            <ToolGuide ns="BcryptGenerator" />
        </div>
    )
}

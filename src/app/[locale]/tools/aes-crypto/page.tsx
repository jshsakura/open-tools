import { getTranslations, setRequestLocale } from "next-intl/server";
import { AesCrypto } from '@/components/tools/aes-crypto';
import { ToolGuide } from "@/components/tool-guide-section";
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"
import { getToolById } from "@/lib/tools-catalog"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;

    const t = await getTranslations({ locale, namespace: "Catalog" });
    return createToolMetadata({
        locale,
        title: t("AesCrypto.title"),
        description: t("AesCrypto.description"),
        path: "/tools/aes-crypto",
    });
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export default async function AesCryptoPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
  setRequestLocale(locale);
    const tc = await getTranslations({ locale, namespace: "Catalog" });
    ;
    const jsonLd = createToolJsonLd({
        locale,
        title: tc("AesCrypto.title"),
        description: tc("AesCrypto.description"),
        path: "/tools/aes-crypto",
        category: "SecurityApplication",
    });

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            <AesCrypto />
            <ToolGuide ns="AesCrypto" />
        </div>
    );
}

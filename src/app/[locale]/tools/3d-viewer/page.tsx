import { Basic3dViewer } from "@/components/tools/3d-viewer"
import { ToolGuide } from "@/components/tool-guide-section"
import { getTranslations , setRequestLocale} from "next-intl/server"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"
import { getToolById } from "@/lib/tools-catalog"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;

    const t = await getTranslations({ locale, namespace: "Catalog" });
    return createToolMetadata({
        locale,
        title: t("Basic3dViewer.title"),
        description: t("Basic3dViewer.description"),
        path: "/tools/3d-viewer",
    })
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export default async function Basic3dViewerPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
  setRequestLocale(locale);
    const tc = await getTranslations({ locale, namespace: "Catalog" });
    const tool = getToolById("3d-viewer");
    const jsonLd = createToolJsonLd({
        locale,
        title: tc("Basic3dViewer.title"),
        description: tc("Basic3dViewer.description"),
        path: "/tools/3d-viewer",
        category: "MultimediaApplication",
    });

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            <Basic3dViewer />
            <ToolGuide ns="Basic3dViewer" />
        </div>
    )
}

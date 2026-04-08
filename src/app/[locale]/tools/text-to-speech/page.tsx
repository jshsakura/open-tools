import { getTranslations , setRequestLocale} from "next-intl/server"
import { ToolGuide } from "@/components/tool-guide-section"
import { ToolPageHeader } from "@/components/tool-page-header"
import { TextToSpeechTool } from "@/components/tools/text-to-speech"
import { getToolById } from "@/lib/tools-catalog"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("TextToSpeech.title"),
    description: t("TextToSpeech.description"),
    path: "/tools/text-to-speech",
  })
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export default async function TextToSpeechPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale);
    const tool = getToolById("text-to-speech")
  const t = await getTranslations({ locale, namespace: "TextToSpeech" })
  const catT = await getTranslations({ locale, namespace: "Catalog" })
    const jsonLd = createToolJsonLd({
    locale,
    title: catT("TextToSpeech.title"),
    description: catT("TextToSpeech.description"),
    path: "/tools/text-to-speech",
    category: "UtilitiesApplication",
  })

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <ToolPageHeader title={t("title")} description={t("description")} toolId="text-to-speech" />
      <TextToSpeechTool />
      <ToolGuide ns="TextToSpeech" />
    </div>
  )
}

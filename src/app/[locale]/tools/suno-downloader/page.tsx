import { getTranslations , setRequestLocale} from "next-intl/server"
import { Music } from "lucide-react"
import { SunoDownloader } from "@/components/tools/suno-downloader"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("SunoDownloader.title"),
    description: t("SunoDownloader.description"),
    path: "/tools/suno-downloader",
  })
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export default async function SunoDownloaderPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale);
  const catalog = await getTranslations({ locale, namespace: "Catalog" })
  const ui = await getTranslations({ locale, namespace: "Suno" })
  const jsonLd = createToolJsonLd({
    locale,
    title: catalog("SunoDownloader.title"),
    description: catalog("SunoDownloader.description"),
    path: "/tools/suno-downloader",
    category: "UtilitiesApplication",
  })

  return (
    <div className="container mx-auto px-4 py-24 min-h-screen max-w-6xl">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <div className="mb-16 text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-pink-500/10 mb-4 ring-1 ring-pink-500/20">
          <Music className="w-8 h-8 text-pink-500" />
        </div>
        <h1 className="text-5xl font-black tracking-tighter text-foreground sm:text-6xl drop-shadow-sm">
          {ui("title")}
        </h1>
        <div className="text-base text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed text-center">
          {ui("descriptionFull").split(". ").map((sentence, index, arr) => (
            <span key={sentence}>
              {sentence}
              {index < arr.length - 1 ? "." : ""}
              {index < arr.length - 1 ? <br /> : null}
            </span>
          ))}
        </div>
      </div>

      <SunoDownloader />
    </div>
  )
}

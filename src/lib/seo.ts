import type { Metadata } from "next"

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  "https://tools.opencourse.kr"

export function getBaseUrl() {
  return baseUrl
}

export function createSeoTitle(title: string) {
  return `${title} | Open Tools`
}

export function createToolMetadata({
  locale,
  title,
  description,
  path,
}: {
  locale: string
  title: string
  description: string
  path: string
}): Metadata {
  const canonical = `${baseUrl}/${locale}${path}`
  const fullTitle = createSeoTitle(title)
  const localeCode = locale === "en" ? "en_US" : "ko_KR"
  const alternateLocale = locale === "en" ? ["ko_KR"] : ["en_US"]

  return {
    title: fullTitle,
    description,
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical,
      languages: {
        "x-default": `${baseUrl}/ko${path}`,
        en: `${baseUrl}/en${path}`,
        ko: `${baseUrl}/ko${path}`,
      },
    },
    openGraph: {
      type: "website",
      url: canonical,
      title: fullTitle,
      description,
      locale: localeCode,
      alternateLocale,
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: ["/opengraph-image"],
    },
  }
}

export function createToolJsonLd({
  locale,
  title,
  description,
  path,
  category,
}: {
  locale: string
  title: string
  description: string
  path: string
  category: string
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: title,
    description,
    applicationCategory: category,
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript. Works in modern browsers.",
    inLanguage: locale,
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    url: `${baseUrl}/${locale}${path}`,
  }
}

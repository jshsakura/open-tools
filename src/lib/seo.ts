import type { Metadata } from "next"

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  "https://tools.opencourse.kr"

export function getBaseUrl() {
  return baseUrl
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
  const fullTitle = `${title} - Open Tools`
  const localeCode = locale === "en" ? "en_US" : "ko_KR"
  const alternateLocale = locale === "en" ? ["ko_KR"] : ["en_US"]

  return {
    title: fullTitle,
    description,
    alternates: {
      canonical,
      languages: {
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
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
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

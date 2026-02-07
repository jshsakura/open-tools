import { MetadataRoute } from 'next'
import { tools } from '@/lib/tools-data'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://opentools.example.com'

export async function generateSitemaps() {
  const locales = ['ko', 'en']
  const sitemaps = []

  for (const locale of locales) {
    sitemaps.push({
      id: locale,
    })
  }

  return sitemaps
}

export default async function sitemap({ id, params }: { id: string; params: Promise<{ locale: string }> }): Promise<MetadataRoute.Sitemap> {
  const { locale } = await params

  const localeTools = tools.map(tool => {
    const href = `/${locale}${tool.href}`
    return {
      url: `${baseUrl}${href}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }
  })

  return [...localeTools, {
    url: `${baseUrl}/${locale}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1.0,
  }]
}

import { MetadataRoute } from 'next'
import { tools } from '@/lib/tools-data'

export const dynamic = 'force-dynamic'

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  'https://tools.opencourse.kr'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const locales = ['ko', 'en']

  const entries = locales.flatMap((locale) => {
    const localeTools = tools.map((tool) => {
      const href = `/${locale}${tool.href}`
      return {
        url: `${baseUrl}${href}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }
    })

    const rootEntry = {
      url: `${baseUrl}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    }

    return [...localeTools, rootEntry]
  })

  return entries
}

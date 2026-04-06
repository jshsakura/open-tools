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
      const path = tool.href
      const href = `/${locale}${path}`
      return {
        url: `${baseUrl}${href}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
        alternates: {
          languages: {
            en: `${baseUrl}/en${path}`,
            ko: `${baseUrl}/ko${path}`,
          },
        },
      }
    })

    const rootEntry = {
      url: `${baseUrl}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
      alternates: {
        languages: {
          en: `${baseUrl}/en`,
          ko: `${baseUrl}/ko`,
        },
      },
    }

    return [...localeTools, rootEntry]
  })

  return entries
}

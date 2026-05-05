import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://mealmate.app'
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/community', '/community/', '/profile/'],
        disallow: ['/recipes', '/plan', '/shopping', '/auth/', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}

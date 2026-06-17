import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/auth/callback'],
    },
    sitemap: 'https://acadconnect.dev/sitemap.xml',
  }
}

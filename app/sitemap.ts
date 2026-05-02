import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

const routes = ['/', '/dashboard', '/briefs/new', '/docs', '/graph', '/logs', '/memory', '/support']

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '/' ? 'daily' : 'weekly',
    priority: route === '/' ? 1 : 0.7,
  }))
}

/**
 * Web app manifest (/favicon/site.webmanifest): the browser chrome takes the
 * page color of the default palette (light) from src/assets/styles/tokens.css.
 */
import type { APIRoute } from 'astro'

import tokensCss from '@/assets/styles/tokens.css?raw'
import { config } from '@/site-config'
import { pageColors } from '@/utils/theme'

export const GET: APIRoute = () => {
  const color = pageColors(tokensCss)[config.site.palette].light
  const manifest = {
    name: config.site.title,
    short_name: 'K. Rhoulam',
    icons: [
      { src: 'android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: 'android-chrome-512x512.png', sizes: '512x512', type: 'image/png' }
    ],
    theme_color: color,
    background_color: color,
    display: 'standalone'
  }
  return new Response(JSON.stringify(manifest, null, 2), {
    headers: { 'Content-Type': 'application/manifest+json' }
  })
}

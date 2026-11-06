const SITE = 'https://docs.mctl.ai'

// Must produce the same URL the sitemap lists for a page. With cleanUrls an
// index page is its directory (`/api/`) and any other page drops `.md`, while
// nginx also answers the `/api` and `/guides/services/` spellings with 200.
// Without a canonical Google has to pick between them on its own.
export function canonicalUrl(relativePath: string): string {
  const path = relativePath.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '')
  return `${SITE}/${path}`
}

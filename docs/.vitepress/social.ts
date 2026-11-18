type Meta = ['meta', Record<string, string>]

const SITE_NAME = 'MCTL Docs'

// Per-page Open Graph and Twitter text tags. The shared image and card type
// stay in the global head list in config.ts; these are the tags that must
// differ from page to page, so link previews show the page title and summary
// instead of falling back to whatever the crawler guesses.
export function socialMeta(
  title: string,
  description: string,
  canonical: string,
  isHome: boolean,
): Meta[] {
  const fullTitle = isHome ? SITE_NAME : `${title} | ${SITE_NAME}`
  return [
    ['meta', { property: 'og:type', content: isHome ? 'website' : 'article' }],
    ['meta', { property: 'og:site_name', content: SITE_NAME }],
    ['meta', { property: 'og:title', content: fullTitle }],
    ['meta', { property: 'og:description', content: description }],
    ['meta', { property: 'og:url', content: canonical }],
    ['meta', { name: 'twitter:title', content: fullTitle }],
    ['meta', { name: 'twitter:description', content: description }],
  ]
}

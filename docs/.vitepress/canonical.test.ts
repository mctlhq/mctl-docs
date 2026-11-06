import { expect, test } from 'bun:test'
import { canonicalUrl } from './canonical'

for (const [relativePath, url] of [
  ['index.md', 'https://docs.mctl.ai/'],
  ['api/index.md', 'https://docs.mctl.ai/api/'],
  ['guides/databases.md', 'https://docs.mctl.ai/guides/databases'],
  ['reference/reindex.md', 'https://docs.mctl.ai/reference/reindex'],
]) {
  test(`${relativePath} maps to its sitemap URL`, () => {
    expect(canonicalUrl(relativePath)).toBe(url)
  })
}

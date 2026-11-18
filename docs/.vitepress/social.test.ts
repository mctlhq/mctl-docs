import { expect, test } from 'bun:test'
import { socialMeta } from './social'

const byKey = (tags: ReturnType<typeof socialMeta>) =>
  Object.fromEntries(tags.map(([, a]) => [a.property ?? a.name, a.content]))

test('inner page gets title with site suffix, its own url and article type', () => {
  const m = byKey(socialMeta('Custom Domains', 'Attach a domain.', 'https://docs.mctl.ai/guides/domains', false))
  expect(m['og:title']).toBe('Custom Domains | MCTL Docs')
  expect(m['twitter:title']).toBe('Custom Domains | MCTL Docs')
  expect(m['og:url']).toBe('https://docs.mctl.ai/guides/domains')
  expect(m['og:type']).toBe('article')
  expect(m['og:description']).toBe('Attach a domain.')
  expect(m['twitter:description']).toBe('Attach a domain.')
})

test('home page uses the bare site name and website type', () => {
  const m = byKey(socialMeta('Home', 'Docs.', 'https://docs.mctl.ai/', true))
  expect(m['og:title']).toBe('MCTL Docs')
  expect(m['og:type']).toBe('website')
})

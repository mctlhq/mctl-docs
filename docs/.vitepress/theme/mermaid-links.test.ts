import { afterAll, beforeAll, expect, test } from 'bun:test'
import { wireMermaidLinks } from './mermaid-links'

const originalWindow = globalThis.window
const events = new EventTarget()
let confirmed: string[] = []
beforeAll(() => {
  globalThis.window = Object.assign(events, { location: { href: 'https://docs.mctl.ai/platform/architecture' } }) as unknown as Window & typeof globalThis
  events.addEventListener('mctl:confirm-mermaid-link', (event) => {
    confirmed.push((event as CustomEvent).detail.href)
  })
})
afterAll(() => { globalThis.window = originalWindow })

for (const href of ['https://ops.mctl.ai/', 'https://api.mctl.ai/docs', '/guides/services', 'http://[']) {
  test(`isolates navigation for ${href}`, () => {
    confirmed = []
    const link = Object.assign(new EventTarget(), { getAttribute: (name: string) => name === 'href' ? href : null })
    wireMermaidLinks({ querySelectorAll: () => [link] } as unknown as ParentNode)
    const event = new Event('click', { cancelable: true, bubbles: true })
    let stopped = false
    event.stopPropagation = () => { stopped = true }
    link.dispatchEvent(event)
    expect(stopped).toBe(true)
    expect(event.defaultPrevented).toBe(href === 'https://ops.mctl.ai/')
    expect(confirmed).toEqual(href === 'https://ops.mctl.ai/' ? [href] : [])
  })
}

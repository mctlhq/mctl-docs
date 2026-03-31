import DefaultTheme from 'vitepress/theme'
import { onContentUpdated } from 'vitepress'
import './custom.css'
import Layout from './Layout.vue'
import McpSetup from './components/McpSetup.vue'
import { renderMermaidSvg } from './mermaid'

const guardedMermaidHosts = new Set(['app.mctl.ai', 'workflows.mctl.ai', 'ops.mctl.ai'])

async function renderMermaidDiagrams() {
  if (typeof document === 'undefined') return

  const nodes = Array.from(document.querySelectorAll<HTMLElement>('.mermaid-diagram')).filter(
    (node) => !node.dataset.rendered,
  )

  if (!nodes.length) return
  let index = 0

  for (const node of nodes) {
    const encoded = node.dataset.mermaid
    if (!encoded) continue

    const source = decodeURIComponent(encoded)
    const { svg } = await renderMermaidSvg(source, `inline-${index++}`)
    node.innerHTML = svg
    node.dataset.rendered = 'true'
    node.dataset.mermaidReady = 'true'

    for (const link of node.querySelectorAll<SVGAElement>('a')) {
      const href = link.getAttribute('href')
      if (!href) continue

      let host = ''
      try {
        host = new URL(href).hostname
      } catch {
        continue
      }

      if (!guardedMermaidHosts.has(host)) continue

      link.addEventListener('click', (event) => {
        event.preventDefault()
        event.stopPropagation()
        window.dispatchEvent(new CustomEvent('mctl:confirm-mermaid-link', { detail: { href } }))
      })
    }

    node.tabIndex = 0
    node.setAttribute('role', 'button')
    node.setAttribute('aria-label', 'Expand diagram')
    node.onclick = () => {
      window.dispatchEvent(new CustomEvent('mctl:open-mermaid', { detail: { source } }))
    }
    node.onkeydown = (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        window.dispatchEvent(new CustomEvent('mctl:open-mermaid', { detail: { source } }))
      }
    }
  }
}

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('McpSetup', McpSetup)
    onContentUpdated(() => {
      void renderMermaidDiagrams()
    })
  },
}

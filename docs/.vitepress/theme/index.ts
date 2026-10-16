import DefaultTheme from 'vitepress/theme-without-fonts'
import { onContentUpdated } from 'vitepress'
import './vitepress-bridge.css'
import './custom.css'
import Layout from './Layout.vue'
import McpSetup from './components/McpSetup.vue'
import { renderMermaidSvg } from './mermaid'

import { wireMermaidLinks } from './mermaid-links'

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
    try {
      const { svg } = await renderMermaidSvg(source, `inline-${index++}`)
      node.innerHTML = svg
    } catch (error) {
      const fallback = document.createElement('pre')
      fallback.textContent = source
      node.replaceChildren(fallback)
      console.error('Could not render Mermaid diagram', error)
      continue
    }
    node.dataset.rendered = 'true'
    node.dataset.mermaidReady = 'true'

    wireMermaidLinks(node)

    node.tabIndex = 0
    node.setAttribute('role', 'button')
    node.setAttribute('aria-label', 'Expand diagram')
    node.onclick = () => {
      window.dispatchEvent(new CustomEvent('mctl:open-mermaid', { detail: { source } }))
    }
    node.onkeydown = (event) => {
      if (event.target !== node) return
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

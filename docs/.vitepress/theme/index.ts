import DefaultTheme from 'vitepress/theme'
import { onContentUpdated } from 'vitepress'
import './custom.css'
import Layout from './Layout.vue'
import { renderMermaidSvg } from './mermaid'

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
  enhanceApp() {
    onContentUpdated(() => {
      void renderMermaidDiagrams()
    })
  },
}

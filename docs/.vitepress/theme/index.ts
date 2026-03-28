import DefaultTheme from 'vitepress/theme'
import { onContentUpdated } from 'vitepress'
import mermaid from 'mermaid'
import './custom.css'
import Layout from './Layout.vue'

let mermaidInitialized = false

async function renderMermaidDiagrams() {
  if (typeof document === 'undefined') return

  const nodes = Array.from(document.querySelectorAll<HTMLElement>('.mermaid-diagram')).filter(
    (node) => !node.dataset.rendered,
  )

  if (!nodes.length) return

  if (!mermaidInitialized) {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      securityLevel: 'loose',
    })
    mermaidInitialized = true
  }

  await mermaid.run({ nodes })

  for (const node of nodes) {
    node.dataset.rendered = 'true'
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

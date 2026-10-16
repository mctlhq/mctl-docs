const guardedHosts = new Set(['app.mctl.ai', 'workflows.mctl.ai', 'ops.mctl.ai'])

/** Keep diagram navigation independent of the container's expand action. */
export function wireMermaidLinks(root: ParentNode) {
  for (const link of root.querySelectorAll('a')) {
    const href = link.getAttribute('href') || link.getAttribute('xlink:href')
    if (!href) continue
    let host = ''
    try {
      host = new URL(href, window.location.href).hostname
    } catch {
      // Even an invalid destination must not trigger diagram expansion.
    }
    link.addEventListener('click', (event) => {
      event.stopPropagation()
      if (!guardedHosts.has(host)) return
      event.preventDefault()
      window.dispatchEvent(new CustomEvent('mctl:confirm-mermaid-link', { detail: { href } }))
    })
  }
}

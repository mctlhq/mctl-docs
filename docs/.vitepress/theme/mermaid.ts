import mermaid from 'mermaid'

let mermaidInitialized = false
let renderSequence = 0

function mermaidThemeVariables() {
  const styles = getComputedStyle(document.documentElement)
  const token = (name: string) => styles.getPropertyValue(name).trim()
  const bg = token('--surface-bg')
  const card = token('--surface-card')
  const elevated = token('--surface-elevated')
  const fg = token('--surface-fg')
  const accent = token('--accent')
  const line = token('--surface-line-strong')
  return {
    background: bg, mainBkg: card, secondBkg: elevated, tertiaryColor: elevated,
    primaryColor: card, primaryTextColor: fg, primaryBorderColor: accent,
    lineColor: token('--surface-fg-muted'), textColor: fg,
    fontFamily: token('--font-mono'), fontSize: token('--text-code-size'),
    clusterBkg: elevated, clusterBorder: line, titleColor: fg,
    edgeLabelBackground: bg, actorBkg: card, actorBorder: accent,
    actorTextColor: fg, actorLineColor: line, signalColor: accent,
    signalTextColor: fg, labelBoxBkgColor: bg, labelBoxBorderColor: line,
    labelTextColor: fg, noteBkgColor: elevated, noteBorderColor: accent,
    noteTextColor: fg, activationBorderColor: accent, activationBkgColor: card,
    sequenceNumberColor: bg,
  }
}

export function ensureMermaidInitialized() {
  if (mermaidInitialized) return

  mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    securityLevel: 'loose',
    themeVariables: mermaidThemeVariables(),
    flowchart: {
      curve: 'basis',
      useMaxWidth: true,
      htmlLabels: false,
      nodeSpacing: 40,
      rankSpacing: 55,
      padding: 18,
    },
    sequence: {
      useMaxWidth: true,
      mirrorActors: false,
      messageMargin: 36,
      noteMargin: 18,
    },
  })

  mermaidInitialized = true
}

export async function renderMermaidSvg(source: string, scope = 'diagram') {
  ensureMermaidInitialized()
  const renderId = `mermaid-${scope}-${Date.now()}-${renderSequence++}`
  return mermaid.render(renderId, source)
}

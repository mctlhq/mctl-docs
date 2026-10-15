import mermaid from 'mermaid'

let mermaidInitialized = false
let renderSequence = 0

function mermaidThemeVariables() {
  const styles = getComputedStyle(document.documentElement)
  const token = (name: string, fallback: string) => styles.getPropertyValue(name).trim() || fallback
  const bg = token('--surface-bg', '#0a0b0d')
  const card = token('--surface-card', '#15181d')
  const elevated = token('--surface-elevated', '#0f1114')
  const fg = token('--surface-fg', '#e6e7e9')
  const accent = token('--accent', '#e25a3c')
  const line = token('--surface-line-strong', '#2a313a')
  return {
    background: bg, mainBkg: card, secondBkg: elevated, tertiaryColor: elevated,
    primaryColor: card, primaryTextColor: fg, primaryBorderColor: accent,
    lineColor: token('--surface-fg-muted', '#a4a8ae'), textColor: fg,
    fontFamily: token('--font-mono', "'JetBrains Mono', ui-monospace, monospace"), fontSize: token('--text-code-size', '14px'),
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

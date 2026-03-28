import mermaid from 'mermaid'

let mermaidInitialized = false
let renderSequence = 0

const mermaidThemeVariables = {
  background: '#0d111d',
  mainBkg: '#101827',
  secondBkg: '#121c2c',
  tertiaryColor: '#0b1220',
  primaryColor: '#132238',
  primaryTextColor: '#f8fafc',
  primaryBorderColor: '#00f5ff',
  lineColor: '#7dd3fc',
  textColor: '#e6edf3',
  fontFamily: 'JetBrains Mono, monospace',
  fontSize: '15px',
  clusterBkg: '#0f1726',
  clusterBorder: '#164e63',
  titleColor: '#ffffff',
  edgeLabelBackground: '#050816',
  actorBkg: '#101827',
  actorBorder: '#00f5ff',
  actorTextColor: '#f8fafc',
  actorLineColor: '#164e63',
  signalColor: '#7dd3fc',
  signalTextColor: '#f8fafc',
  labelBoxBkgColor: '#050816',
  labelBoxBorderColor: '#164e63',
  labelTextColor: '#e6edf3',
  noteBkgColor: '#132238',
  noteBorderColor: '#00f5ff',
  noteTextColor: '#e6edf3',
  activationBorderColor: '#00f5ff',
  activationBkgColor: '#0f2b36',
  sequenceNumberColor: '#050816',
}

export function ensureMermaidInitialized() {
  if (mermaidInitialized) return

  mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    securityLevel: 'loose',
    themeVariables: mermaidThemeVariables,
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

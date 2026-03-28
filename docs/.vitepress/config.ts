import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'MCTL',
  description: 'Documentation for the MCTL platform — AI-native infrastructure management',
  cleanUrls: true,
  lastUpdated: true,
  appearance: 'force-dark',

  head: [
    ['link', { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { href: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&display=swap', rel: 'stylesheet' }],
    ['meta', { name: 'theme-color', content: '#050816' }],
  ],

  themeConfig: {
    siteTitle: '<span class="logo"><span class="logo-m">M</span>CTL</span>',

    search: {
      provider: 'local',
    },

    nav: [
      { text: 'Getting Started', link: '/getting-started/' },
      { text: 'Guides', link: '/guides/tenants' },
      { text: 'MCP', link: '/mcp/overview' },
      { text: 'API', link: '/api/' },
      { text: 'Docs Portal', link: 'https://docs.mctl.ai' },
      {
        text: 'Links',
        items: [
          { text: 'mctl.ai', link: 'https://mctl.ai' },
          { text: 'Portal', link: 'https://app.mctl.ai' },
          { text: 'GitHub', link: 'https://github.com/mctlhq' },
        ],
      },
    ],

    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Quick Start', link: '/getting-started/' },
        ],
      },
      {
        text: 'Platform',
        collapsed: false,
        items: [
          { text: 'Overview', link: '/platform/overview' },
          { text: 'Architecture', link: '/platform/architecture' },
          { text: 'Components', link: '/platform/components' },
        ],
      },
      {
        text: 'Guides',
        collapsed: false,
        items: [
          { text: 'Tenants', link: '/guides/tenants' },
          { text: 'Services', link: '/guides/services' },
          { text: 'GitOps Workflows', link: '/guides/gitops-workflows' },
          { text: 'Custom Domains', link: '/guides/domains' },
          { text: 'Databases', link: '/guides/databases' },
          { text: 'Preview Environments', link: '/guides/previews' },
          { text: 'Scaling', link: '/guides/scaling' },
          { text: 'Rollbacks', link: '/guides/rollbacks' },
        ],
      },
      {
        text: 'MCP Server',
        collapsed: false,
        items: [
          { text: 'Overview', link: '/mcp/overview' },
          { text: 'Connecting', link: '/mcp/connecting' },
          { text: 'Tools Reference', link: '/mcp/tools-reference' },
          { text: 'Examples', link: '/mcp/examples' },
        ],
      },
      {
        text: 'Security',
        collapsed: true,
        items: [
          { text: 'Authentication', link: '/security/authentication' },
          { text: 'Authorization', link: '/security/authorization' },
        ],
      },
      {
        text: 'API',
        collapsed: true,
        items: [
          { text: 'REST API', link: '/api/' },
        ],
      },
      {
        text: 'Reference',
        collapsed: true,
        items: [
          { text: 'FAQ', link: '/reference/faq' },
          { text: 'Troubleshooting', link: '/reference/troubleshooting' },
          { text: 'Glossary', link: '/reference/glossary' },
        ],
      },
    ],

    editLink: {
      pattern: 'https://github.com/mctlhq/mctl-docs/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },

    footer: {
      message: 'Released under the Apache 2.0 License.',
      copyright: 'Copyright 2025-present MCTL',
    },
  },

  markdown: {
    config(md) {
      const defaultFence =
        md.renderer.rules.fence?.bind(md.renderer.rules) ??
        ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options))

      md.renderer.rules.fence = (tokens, idx, options, env, self) => {
        const token = tokens[idx]
        const language = token.info.trim().split(/\s+/)[0]

        if (language === 'mermaid') {
          return `<div class="mermaid-diagram">${md.utils.escapeHtml(token.content.trim())}</div>`
        }

        return defaultFence(tokens, idx, options, env, self)
      }
    },
  },
})

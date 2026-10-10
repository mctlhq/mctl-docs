<script setup lang="ts">
import { ref, onMounted } from 'vue'

const MCP_ENDPOINT = 'https://api.mctl.ai/mcp'
const CLAUDE_CODE_CMD = 'claude mcp add --transport http mctl ' + MCP_ENDPOINT
// Older versions of this page kept a GitHub token here for the clients that
// could not sign in by themselves. Every client now signs in through MCTL.
const LEGACY_AUTH_KEY = 'mctl_auth'

const activeTab = ref('claude-ai')
const copied = ref<Record<string, boolean>>({})

async function copy(key: string, text: string) {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.cssText = 'position:fixed;opacity:0'
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  }
  copied.value[key] = true
  setTimeout(() => { copied.value[key] = false }, 1800)
}

// No config carries a credential: every client signs in through MCTL with
// the standard MCP authorization flow, starting from the server URL alone.
const configs = {
  cursor: JSON.stringify({
    mcpServers: { mctl: { url: MCP_ENDPOINT } }
  }, null, 2),

  vscode: JSON.stringify({
    servers: { mctl: { type: 'http', url: MCP_ENDPOINT } }
  }, null, 2),

  windsurf: JSON.stringify({
    mcpServers: { mctl: { type: 'http', url: MCP_ENDPOINT } }
  }, null, 2),

  gemini: JSON.stringify({
    mcpServers: { mctl: { httpUrl: MCP_ENDPOINT, trust: true } }
  }, null, 2),

  copilot: JSON.stringify({
    mcpServers: { mctl: { type: 'http', url: MCP_ENDPOINT } }
  }, null, 2),

  other: [
    '# Streamable HTTP transport',
    '# Single endpoint \u2014 POST to call tools, GET to open stream',
    '',
    'endpoint:   ' + MCP_ENDPOINT,
    'transport:  streamable-http',
    'auth:       MCP authorization (OAuth 2.1, PKCE, dynamic client registration)',
    'discovery:  https://api.mctl.ai/.well-known/oauth-protected-resource',
  ].join('\n'),
}

onMounted(() => {
  try { localStorage.removeItem(LEGACY_AUTH_KEY) } catch {}
  // A sign-in started from an older version of this page may still land
  // here with a token handoff in the fragment. Drop it unread.
  const hash = window.location.hash
  if (hash.startsWith('#session=') || hash.startsWith('#auth=') || hash.startsWith('#auth_error=')) {
    history.replaceState(null, '', location.pathname + location.search)
  }
})

const tabs = [
  { key: 'claude-ai', label: 'Claude.ai' },
  { key: 'claude-code', label: 'Claude Code' },
  { key: 'claude', label: 'Claude Desktop' },
  { key: 'cursor', label: 'Cursor' },
  { key: 'vscode', label: 'VS Code' },
  { key: 'windsurf', label: 'Windsurf' },
  { key: 'gemini', label: 'Gemini CLI' },
  { key: 'copilot', label: 'Copilot CLI' },
  { key: 'other', label: 'Other' },
]
</script>

<template>
  <div class="mcp-setup">
    <div class="mcp-grid">

      <!-- Access card -->
      <div class="auth-card">
        <h3>Sign in with MCTL</h3>
        <p class="auth-desc">Give your client the server URL and nothing else. On first use it opens the MCTL sign-in page in your browser and returns to the client on its own. There is no token to copy.</p>
        <div class="val-value-row">
          <code>{{ MCP_ENDPOINT }}</code>
          <button class="btn-copy" :class="{ copied: copied['endpoint'] }" @click="copy('endpoint', MCP_ENDPOINT)">{{ copied['endpoint'] ? 'copied!' : 'copy' }}</button>
        </div>
        <p class="auth-hint" style="margin-top:1rem">
          Access requires membership in a team workspace.<br>
          Not added yet? <a href="https://mctl.ai/#request-access">Request access</a> from your platform admin.
        </p>
      </div>

      <!-- Config tabs -->
      <div class="config-panel">
        <div class="tabs-nav" role="tablist">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="tab-btn"
            :class="{ active: activeTab === tab.key }"
            role="tab"
            @click="activeTab = tab.key"
          >{{ tab.label }}</button>
        </div>

        <!-- Claude.ai -->
        <div v-show="activeTab === 'claude-ai'" class="tab-content">
          <p class="config-path"><strong>Claude.ai</strong> &rarr; Settings &rarr; Connectors &rarr; Add custom connector</p>
          <div class="connector-values">
            <div class="val-block">
              <span class="val-label">Remote MCP server URL</span>
              <div class="val-value-row">
                <code>{{ MCP_ENDPOINT }}</code>
                <button class="btn-copy" :class="{ copied: copied['ai-url'] }" @click="copy('ai-url', MCP_ENDPOINT)">{{ copied['ai-url'] ? 'copied!' : 'copy' }}</button>
              </div>
            </div>
            <div class="val-block">
              <span class="val-label">OAuth Client ID and Client Secret</span>
              <div class="val-value-row">
                <span class="muted">Leave both empty: Claude registers itself</span>
              </div>
            </div>
          </div>
          <p class="config-note">Click Add, then Connect &mdash; the MCTL sign-in page opens, then you'll be returned to Claude automatically. No token needed.</p>
        </div>

        <!-- Claude Code -->
        <div v-show="activeTab === 'claude-code'" class="tab-content">
          <p class="config-path">Run in your terminal</p>
          <div class="code-block-wrap">
            <pre>{{ CLAUDE_CODE_CMD }}</pre>
            <button class="btn-copy" :class="{ copied: copied['cfg-claude-code'] }" @click="copy('cfg-claude-code', CLAUDE_CODE_CMD)">{{ copied['cfg-claude-code'] ? 'copied!' : 'copy' }}</button>
          </div>
          <p class="config-note">Then run <code>/mcp</code> inside Claude Code and choose <strong>mctl</strong> &rarr; Authenticate. The MCTL sign-in page opens in your browser. No token needed.</p>
        </div>

        <!-- Claude Desktop -->
        <div v-show="activeTab === 'claude'" class="tab-content">
          <p class="config-path"><strong>Claude Desktop</strong> &rarr; Settings &rarr; Connectors &rarr; Add custom connector</p>
          <div class="connector-values">
            <div class="val-block">
              <span class="val-label">Remote MCP server URL</span>
              <div class="val-value-row">
                <code>{{ MCP_ENDPOINT }}</code>
                <button class="btn-copy" :class="{ copied: copied['desktop-url'] }" @click="copy('desktop-url', MCP_ENDPOINT)">{{ copied['desktop-url'] ? 'copied!' : 'copy' }}</button>
              </div>
            </div>
            <div class="val-block">
              <span class="val-label">OAuth Client ID and Client Secret</span>
              <div class="val-value-row">
                <span class="muted">Leave both empty: Claude Desktop registers itself</span>
              </div>
            </div>
          </div>
          <p class="config-note">Click Connect &mdash; the MCTL sign-in page opens in your browser. No token needed. A connector you already added on Claude.ai shows up in Claude Desktop too.</p>
        </div>

        <!-- Cursor -->
        <div v-show="activeTab === 'cursor'" class="tab-content">
          <p class="config-path">Add to <code>~/.cursor/mcp.json</code>, or Cursor Settings &rarr; MCP &rarr; Add server</p>
          <div class="code-block-wrap">
            <pre>{{ configs.cursor }}</pre>
            <button class="btn-copy" :class="{ copied: copied['cfg-cursor'] }" @click="copy('cfg-cursor', configs.cursor)">{{ copied['cfg-cursor'] ? 'copied!' : 'copy' }}</button>
          </div>
          <p class="config-note">Cursor then asks you to sign in to <strong>mctl</strong> in its MCP settings. The MCTL sign-in page opens in your browser. No token needed.</p>
        </div>

        <!-- VS Code -->
        <div v-show="activeTab === 'vscode'" class="tab-content">
          <p class="config-path">Create <code>.vscode/mcp.json</code> in your project root</p>
          <div class="code-block-wrap">
            <pre>{{ configs.vscode }}</pre>
            <button class="btn-copy" :class="{ copied: copied['cfg-vscode'] }" @click="copy('cfg-vscode', configs.vscode)">{{ copied['cfg-vscode'] ? 'copied!' : 'copy' }}</button>
          </div>
          <p class="config-note">Start the server from the file; VS Code asks to sign in and opens the MCTL sign-in page in your browser. No token needed. Requires a recent VS Code with the GitHub Copilot Chat extension.</p>
        </div>

        <!-- Windsurf -->
        <div v-show="activeTab === 'windsurf'" class="tab-content">
          <p class="config-path">Windsurf Settings &rarr; MCP Servers &rarr; Add</p>
          <div class="code-block-wrap">
            <pre>{{ configs.windsurf }}</pre>
            <button class="btn-copy" :class="{ copied: copied['cfg-windsurf'] }" @click="copy('cfg-windsurf', configs.windsurf)">{{ copied['cfg-windsurf'] ? 'copied!' : 'copy' }}</button>
          </div>
          <p class="config-note">MCTL sign-in from Windsurf is not enabled yet. Until it is, connect from Claude Code, Cursor, VS Code or Gemini CLI.</p>
        </div>

        <!-- Gemini CLI -->
        <div v-show="activeTab === 'gemini'" class="tab-content">
          <p class="config-path">Add to <code>~/.gemini/settings.json</code></p>
          <div class="code-block-wrap">
            <pre>{{ configs.gemini }}</pre>
            <button class="btn-copy" :class="{ copied: copied['cfg-gemini'] }" @click="copy('cfg-gemini', configs.gemini)">{{ copied['cfg-gemini'] ? 'copied!' : 'copy' }}</button>
          </div>
          <p class="config-note">Then run <code>/mcp auth mctl</code> inside Gemini CLI. The MCTL sign-in page opens in your browser. No token needed. The sign-in needs a browser on the same machine, so it does not work over SSH.</p>
        </div>

        <!-- Copilot CLI -->
        <div v-show="activeTab === 'copilot'" class="tab-content">
          <p class="config-path">Add to <code>~/.config/github-copilot/mcp.json</code></p>
          <div class="code-block-wrap">
            <pre>{{ configs.copilot }}</pre>
            <button class="btn-copy" :class="{ copied: copied['cfg-copilot'] }" @click="copy('cfg-copilot', configs.copilot)">{{ copied['cfg-copilot'] ? 'copied!' : 'copy' }}</button>
          </div>
          <p class="config-note">MCTL sign-in from Copilot CLI is not enabled yet. Until it is, connect from Claude Code, Cursor, VS Code or Gemini CLI.</p>
        </div>

        <!-- Other -->
        <div v-show="activeTab === 'other'" class="tab-content">
          <p class="config-path">Generic MCP client connection details</p>
          <div class="code-block-wrap">
            <pre>{{ configs.other }}</pre>
            <button class="btn-copy" :class="{ copied: copied['cfg-other'] }" @click="copy('cfg-other', configs.other)">{{ copied['cfg-other'] ? 'copied!' : 'copy' }}</button>
          </div>
          <p class="config-note">Transport: <strong>Streamable HTTP</strong>. Any client that implements MCP authorization finds the sign-in on its own from the first <code>401</code> response; register the client dynamically and sign in through the browser.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mcp-setup {
  margin: 1.5rem 0;
}

.mcp-grid {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 1.5rem;
  align-items: start;
}

@media (max-width: 860px) {
  .mcp-grid {
    grid-template-columns: 1fr;
  }
}

/* ── Auth card ── */
.auth-card {
  background: var(--surface-card);
  border: 1.5px solid var(--surface-line);
  border-radius: 12px;
  padding: 1.5rem;
}

.auth-card h3 {
  margin: 0 0 0.5rem;
  font-size: 1.1rem;
  color: var(--surface-fg);
  font-family: 'JetBrains Mono', monospace;
}

.auth-desc {
  font-size: 0.85rem;
  color: var(--surface-fg-muted);
  line-height: 1.5;
  margin: 0 0 0.75rem;
}

.auth-hint {
  font-size: 0.78rem;
  color: var(--surface-fg-subtle);
  line-height: 1.5;
  margin: 0 0 1rem;
}

.auth-hint a {
  color: var(--accent);
}

/* ── Config panel ── */
.config-panel {
  background: var(--surface-card);
  border: 1.5px solid var(--surface-line);
  border-radius: 12px;
  overflow: hidden;
}

.tabs-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0;
  border-bottom: 1px solid var(--surface-line);
  padding: 0;
}

.tab-btn {
  padding: 0.6rem 0.9rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--surface-fg-subtle);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.72rem;
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.15s, border-color 0.15s;
}

.tab-btn:hover {
  color: var(--surface-fg-muted);
}

.tab-btn.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}

.tab-content {
  padding: 1.25rem;
}

.config-path {
  font-size: 0.82rem;
  color: var(--surface-fg-muted);
  margin: 0 0 0.75rem;
  line-height: 1.4;
}

.config-path code {
  background: color-mix(in srgb, var(--accent) 8%, transparent);
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  font-size: 0.78rem;
  color: var(--accent);
}

.config-note {
  font-size: 0.78rem;
  color: var(--surface-fg-subtle);
  margin: 0.75rem 0 0;
  line-height: 1.5;
}

.config-note strong {
  color: var(--surface-fg);
}

.config-note code {
  background: color-mix(in srgb, var(--accent) 8%, transparent);
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
  font-size: 0.75rem;
  color: var(--accent);
}

/* ── Connector values (Claude.ai) ── */
.connector-values {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.val-block {
  padding: 0.5rem 0.75rem;
  background: var(--surface-bg);
  border: 1px solid var(--surface-line);
  border-radius: 6px;
  font-size: 0.8rem;
}

.val-label {
  display: block;
  color: var(--surface-fg-subtle);
  font-size: 0.7rem;
  margin-bottom: 0.3rem;
}

.val-value-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.val-value-row code {
  flex: 1;
  color: var(--surface-fg);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.78rem;
  background: none;
  padding: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.val-value-row .muted {
  flex: 1;
  color: var(--surface-fg-muted);
  font-size: 0.78rem;
}

/* ── Code blocks ── */
.code-block-wrap {
  position: relative;
  background: var(--surface-bg);
  border: 1px solid var(--surface-line);
  border-radius: 8px;
  overflow: hidden;
}

.code-block-wrap pre {
  margin: 0;
  padding: 1rem;
  overflow-x: auto;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.78rem;
  line-height: 1.6;
  color: var(--surface-fg);
  white-space: pre;
}

/* ── Copy button ── */
.btn-copy {
  padding: 0.25rem 0.6rem;
  background: transparent;
  border: 1px solid var(--surface-line);
  border-radius: 4px;
  color: var(--surface-fg-subtle);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  cursor: pointer;
  flex-shrink: 0;
  transition: color 0.15s, border-color 0.15s;
}

.btn-copy:hover {
  color: var(--accent);
  border-color: var(--accent);
}

.btn-copy.copied {
  color: var(--status-ok);
  border-color: var(--status-ok);
}

.code-block-wrap .btn-copy {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
}
</style>

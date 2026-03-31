<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const MCP_ENDPOINT = 'https://api.mctl.ai/mcp'
const TOKEN_PLACEHOLDER = 'YOUR_GITHUB_TOKEN'
const AUTH_KEY = 'mctl_auth'
const AUTH_TTL = 8 * 60 * 60 * 1000
const LOGIN_URL = 'https://mctl.ai/api/github/login?for=docs'

interface StoredAuth {
  token?: string
  login?: string
  name?: string
  avatar_url?: string
  exp: number
}

function loadStorage(): StoredAuth | null {
  try {
    const d = JSON.parse(localStorage.getItem(AUTH_KEY) || 'null') as StoredAuth | null
    if (!d || Date.now() > d.exp) { localStorage.removeItem(AUTH_KEY); return null }
    return d
  } catch { return null }
}

function saveStorage(data: Partial<StoredAuth>) {
  try {
    const cur = loadStorage() || ({} as Partial<StoredAuth>)
    localStorage.setItem(AUTH_KEY, JSON.stringify({ ...cur, ...data, exp: Date.now() + AUTH_TTL }))
  } catch {}
}

function clearStorage() {
  try { localStorage.removeItem(AUTH_KEY) } catch {}
}

const mcpToken = ref('')
const mcpLogin = ref('')
const mcpName = ref('')
const mcpAvatarUrl = ref('')
const authError = ref('')
const manualTokenInput = ref('')
const isAuthenticated = computed(() => !!mcpToken.value)
const maskedToken = computed(() => mcpToken.value
  ? mcpToken.value.slice(0, 8) + '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022' + mcpToken.value.slice(-4)
  : '')

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

const configToken = computed(() => mcpToken.value || TOKEN_PLACEHOLDER)

const configs = computed(() => {
  const t = configToken.value
  return {
    claude: JSON.stringify({
      mcpServers: { mctl: { type: 'http', url: MCP_ENDPOINT, headers: { Authorization: 'Bearer ' + t } } }
    }, null, 2),

    cursor: JSON.stringify({
      mcpServers: { mctl: { type: 'http', url: MCP_ENDPOINT, headers: { Authorization: 'Bearer ' + t } } }
    }, null, 2),

    vscode: t === TOKEN_PLACEHOLDER
      ? JSON.stringify({
          servers: { mctl: { type: 'http', url: MCP_ENDPOINT, headers: { Authorization: 'Bearer ${input:mctlToken}' } } },
          inputs: [{ id: 'mctlToken', type: 'promptString', description: 'GitHub token \u2014 run: gh auth token', password: true }]
        }, null, 2)
      : JSON.stringify({
          servers: { mctl: { type: 'http', url: MCP_ENDPOINT, headers: { Authorization: 'Bearer ' + t } } }
        }, null, 2),

    windsurf: JSON.stringify({
      mcpServers: { mctl: { type: 'http', url: MCP_ENDPOINT, headers: { Authorization: 'Bearer ' + t } } }
    }, null, 2),

    gemini: JSON.stringify({
      mcpServers: { mctl: { httpUrl: MCP_ENDPOINT, headers: { Authorization: 'Bearer ' + t }, trust: true } }
    }, null, 2),

    copilot: JSON.stringify({
      mcpServers: { mctl: { type: 'http', url: MCP_ENDPOINT, headers: { Authorization: 'Bearer ' + t } } }
    }, null, 2),

    other: [
      '# Streamable HTTP transport (MCP spec 2024-11-05)',
      '# Single endpoint \u2014 POST to call tools, GET to open stream',
      '',
      'endpoint:   ' + MCP_ENDPOINT,
      'transport:  streamable-http',
      'auth:       Authorization: Bearer ' + t,
    ].join('\n'),
  }
})

function setAuth(token: string, login: string, name: string, avatarUrl: string) {
  mcpToken.value = token
  mcpLogin.value = login
  mcpName.value = name || login
  mcpAvatarUrl.value = avatarUrl || ''
  saveStorage({ token, login, name: mcpName.value, avatar_url: avatarUrl || '' })
}

function signOut() {
  mcpToken.value = ''
  mcpLogin.value = ''
  mcpName.value = ''
  mcpAvatarUrl.value = ''
  manualTokenInput.value = ''
  clearStorage()
}

function applyManualToken() {
  const token = manualTokenInput.value.trim()
  if (!token) return
  mcpToken.value = token
  mcpLogin.value = ''
  mcpName.value = ''
  mcpAvatarUrl.value = ''
  saveStorage({ token })
}

const AUTH_ERROR_MSGS: Record<string, string> = {
  ACCESS_DENIED: 'GitHub access denied. Please try again.',
  INVALID_STATE: 'Auth state mismatch. Please try again.',
  TOKEN_EXCHANGE: 'Failed to exchange GitHub token. Please try again.',
  PROFILE_FETCH: 'Failed to fetch GitHub profile. Please try again.',
}

onMounted(() => {
  const hash = window.location.hash

  if (hash.startsWith('#auth_error=')) {
    const code = hash.slice(12)
    authError.value = AUTH_ERROR_MSGS[code] || 'GitHub auth failed. Please try again.'
    history.replaceState(null, '', location.pathname)
    return
  }

  if (hash.startsWith('#auth=')) {
    const encoded = hash.slice(6)
    try {
      const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
      const data = JSON.parse(atob(base64))
      if (data.token) {
        setAuth(data.token, data.login || '', data.name || '', data.avatar_url || '')
      }
    } catch {
      authError.value = 'Failed to parse auth response. Please try again.'
    }
    history.replaceState(null, '', location.pathname)
  } else {
    const saved = loadStorage()
    if (saved?.token) {
      setAuth(saved.token, saved.login || '', saved.name || '', saved.avatar_url || '')
    }
  }
})

const tabs = [
  { key: 'claude-ai', label: 'Claude.ai' },
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

      <!-- Auth card -->
      <div class="auth-card">
        <h3>Get your token</h3>
        <p class="auth-desc">Authenticate with GitHub to get a pre-filled config for your developer client.</p>
        <p class="auth-hint">
          Access requires membership in a team workspace.<br>
          Not added yet? <a href="https://mctl.ai/#request-access">Request access</a> from your platform admin.
        </p>

        <!-- Unauthenticated -->
        <template v-if="!isAuthenticated">
          <a :href="LOGIN_URL" class="btn-github">
            <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            Get your token
          </a>

          <p class="auth-perms">
            Permissions requested: <strong>read your username and avatar</strong> (<code>read:user</code>) and
            <strong>verified email</strong> (<code>user:email</code>).<br>
            No access to your code, repositories, or organizations.
            See our <a href="https://mctl.ai/privacy">Privacy Policy</a>.
          </p>

          <div class="auth-divider"><span>or</span></div>

          <div class="token-input-row">
            <input
              v-model="manualTokenInput"
              class="token-input"
              type="password"
              placeholder="ghp_... or gho_... token"
              autocomplete="off"
              spellcheck="false"
              @keydown.enter="applyManualToken"
            >
            <button class="btn-apply" @click="applyManualToken">Apply</button>
          </div>
          <p class="auth-hint" style="margin-top:0.5rem">
            Get via CLI: <code>gh auth token</code>
          </p>
        </template>

        <!-- Authenticated -->
        <template v-else>
          <div v-if="mcpLogin" class="user-profile">
            <img v-if="mcpAvatarUrl" class="user-avatar" :src="mcpAvatarUrl" :alt="mcpLogin">
            <div class="user-info">
              <div class="user-login">@{{ mcpLogin }}</div>
              <div v-if="mcpName !== mcpLogin" class="user-name">{{ mcpName }}</div>
            </div>
            <button class="btn-signout" title="Sign out" @click="signOut">&times;</button>
          </div>
          <div v-else class="user-profile">
            <span class="auth-hint">Token applied</span>
            <button class="btn-signout" title="Sign out" @click="signOut">&times;</button>
          </div>

          <div class="token-row">
            <span class="token-label">token</span>
            <span class="token-value">{{ maskedToken }}</span>
            <button
              class="btn-copy"
              :class="{ copied: copied['token'] }"
              @click="copy('token', mcpToken)"
            >{{ copied['token'] ? 'copied!' : 'copy' }}</button>
          </div>

          <p class="auth-hint">
            Token is validated server-side on every request.<br>
            Access scoped to your team memberships.
          </p>
        </template>

        <div v-if="authError" class="auth-error">{{ authError }}</div>
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
                <code>https://api.mctl.ai/mcp</code>
                <button class="btn-copy" :class="{ copied: copied['ai-url'] }" @click="copy('ai-url', 'https://api.mctl.ai/mcp')">{{ copied['ai-url'] ? 'copied!' : 'copy' }}</button>
              </div>
            </div>
            <div class="val-block">
              <span class="val-label">OAuth Client ID</span>
              <div class="val-value-row">
                <code>mctl-connector</code>
                <button class="btn-copy" :class="{ copied: copied['ai-id'] }" @click="copy('ai-id', 'mctl-connector')">{{ copied['ai-id'] ? 'copied!' : 'copy' }}</button>
              </div>
            </div>
            <div class="val-block">
              <span class="val-label">Client Secret</span>
              <div class="val-value-row">
                <span class="muted">Leave empty (PKCE)</span>
              </div>
            </div>
          </div>
          <p class="config-note">Click Connect &mdash; GitHub will open for sign-in, then you'll be returned to Claude automatically. No token needed.</p>
        </div>

        <!-- Claude Desktop -->
        <div v-show="activeTab === 'claude'" class="tab-content">
          <p class="config-path">Add to <code>~/Library/Application Support/Claude/claude_desktop_config.json</code></p>
          <div class="code-block-wrap">
            <pre>{{ configs.claude }}</pre>
            <button class="btn-copy" :class="{ copied: copied['cfg-claude'] }" @click="copy('cfg-claude', configs.claude)">{{ copied['cfg-claude'] ? 'copied!' : 'copy' }}</button>
          </div>
          <p class="config-note">Restart Claude Desktop after saving.</p>
        </div>

        <!-- Cursor -->
        <div v-show="activeTab === 'cursor'" class="tab-content">
          <p class="config-path">Cursor Settings &rarr; MCP &rarr; Add server</p>
          <div class="code-block-wrap">
            <pre>{{ configs.cursor }}</pre>
            <button class="btn-copy" :class="{ copied: copied['cfg-cursor'] }" @click="copy('cfg-cursor', configs.cursor)">{{ copied['cfg-cursor'] ? 'copied!' : 'copy' }}</button>
          </div>
        </div>

        <!-- VS Code -->
        <div v-show="activeTab === 'vscode'" class="tab-content">
          <p class="config-path">Create <code>.vscode/mcp.json</code> in your project root</p>
          <div class="code-block-wrap">
            <pre>{{ configs.vscode }}</pre>
            <button class="btn-copy" :class="{ copied: copied['cfg-vscode'] }" @click="copy('cfg-vscode', configs.vscode)">{{ copied['cfg-vscode'] ? 'copied!' : 'copy' }}</button>
          </div>
          <p class="config-note">Requires VS Code &ge; 1.99 with the GitHub Copilot Chat extension.</p>
        </div>

        <!-- Windsurf -->
        <div v-show="activeTab === 'windsurf'" class="tab-content">
          <p class="config-path">Windsurf Settings &rarr; MCP Servers &rarr; Add</p>
          <div class="code-block-wrap">
            <pre>{{ configs.windsurf }}</pre>
            <button class="btn-copy" :class="{ copied: copied['cfg-windsurf'] }" @click="copy('cfg-windsurf', configs.windsurf)">{{ copied['cfg-windsurf'] ? 'copied!' : 'copy' }}</button>
          </div>
        </div>

        <!-- Gemini CLI -->
        <div v-show="activeTab === 'gemini'" class="tab-content">
          <p class="config-path">Add to <code>~/.gemini/settings.json</code></p>
          <div class="code-block-wrap">
            <pre>{{ configs.gemini }}</pre>
            <button class="btn-copy" :class="{ copied: copied['cfg-gemini'] }" @click="copy('cfg-gemini', configs.gemini)">{{ copied['cfg-gemini'] ? 'copied!' : 'copy' }}</button>
          </div>
        </div>

        <!-- Copilot CLI -->
        <div v-show="activeTab === 'copilot'" class="tab-content">
          <p class="config-path">Add to <code>~/.config/github-copilot/mcp.json</code></p>
          <div class="code-block-wrap">
            <pre>{{ configs.copilot }}</pre>
            <button class="btn-copy" :class="{ copied: copied['cfg-copilot'] }" @click="copy('cfg-copilot', configs.copilot)">{{ copied['cfg-copilot'] ? 'copied!' : 'copy' }}</button>
          </div>
          <p class="config-note">Requires <code>gh copilot</code> extension.</p>
        </div>

        <!-- Other -->
        <div v-show="activeTab === 'other'" class="tab-content">
          <p class="config-path">Generic MCP client connection details</p>
          <div class="code-block-wrap">
            <pre>{{ configs.other }}</pre>
            <button class="btn-copy" :class="{ copied: copied['cfg-other'] }" @click="copy('cfg-other', configs.other)">{{ copied['cfg-other'] ? 'copied!' : 'copy' }}</button>
          </div>
          <p class="config-note">Transport: <strong>Streamable HTTP</strong> (MCP spec 2024-11-05). Send the <code>Authorization</code> header on every request.</p>
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
  background: #0c1222;
  border: 1.5px solid #1a2740;
  border-radius: 12px;
  padding: 1.5rem;
}

.auth-card h3 {
  margin: 0 0 0.5rem;
  font-size: 1.1rem;
  color: #fff;
  font-family: 'JetBrains Mono', monospace;
}

.auth-desc {
  font-size: 0.85rem;
  color: #9ca3af;
  line-height: 1.5;
  margin: 0 0 0.75rem;
}

.auth-hint {
  font-size: 0.78rem;
  color: #6b7280;
  line-height: 1.5;
  margin: 0 0 1rem;
}

.auth-hint a {
  color: #00f5ff;
}

.auth-perms {
  font-size: 0.72rem;
  line-height: 1.5;
  color: #6b7280;
  margin: 0.75rem 0 0;
}

.auth-perms strong {
  color: #9ca3af;
}

.auth-perms a {
  color: #00f5ff;
}

.btn-github {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: transparent;
  border: 1.5px solid #00f5ff;
  border-radius: 8px;
  color: #00f5ff;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
}

.btn-github:hover {
  background: rgba(0, 245, 255, 0.08);
  box-shadow: 0 0 20px rgba(0, 245, 255, 0.15);
}

.auth-divider {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1rem 0;
  color: #475569;
  font-size: 0.78rem;
}

.auth-divider::before,
.auth-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #1a2740;
}

.token-input-row {
  display: flex;
  gap: 0.5rem;
}

.token-input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  background: #050816;
  border: 1px solid #1a2740;
  border-radius: 6px;
  color: #fff;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
}

.token-input::placeholder {
  color: #475569;
}

.btn-apply {
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid #00f5ff;
  border-radius: 6px;
  color: #00f5ff;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
  cursor: pointer;
}

.btn-apply:hover {
  background: rgba(0, 245, 255, 0.08);
}

/* ── User profile ── */
.user-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: rgba(0, 245, 255, 0.04);
  border: 1px solid rgba(0, 245, 255, 0.15);
  border-radius: 8px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-login {
  font-size: 0.85rem;
  font-weight: 600;
  color: #fff;
  font-family: 'JetBrains Mono', monospace;
}

.user-name {
  font-size: 0.75rem;
  color: #9ca3af;
}

.btn-signout {
  background: none;
  border: none;
  color: #6b7280;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
}

.btn-signout:hover {
  color: #f85149;
}

/* ── Token row ── */
.token-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: #050816;
  border: 1px solid #1a2740;
  border-radius: 6px;
  margin-bottom: 0.75rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.78rem;
}

.token-label {
  color: #6b7280;
  flex-shrink: 0;
}

.token-value {
  flex: 1;
  color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ── Auth error ── */
.auth-error {
  margin-top: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: rgba(248, 81, 73, 0.1);
  border: 1px solid rgba(248, 81, 73, 0.3);
  border-radius: 6px;
  color: #f85149;
  font-size: 0.8rem;
}

/* ── Config panel ── */
.config-panel {
  background: #0c1222;
  border: 1.5px solid #1a2740;
  border-radius: 12px;
  overflow: hidden;
}

.tabs-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0;
  border-bottom: 1px solid #1a2740;
  padding: 0;
}

.tab-btn {
  padding: 0.6rem 0.9rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: #6b7280;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.72rem;
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.15s, border-color 0.15s;
}

.tab-btn:hover {
  color: #9ca3af;
}

.tab-btn.active {
  color: #00f5ff;
  border-bottom-color: #00f5ff;
}

.tab-content {
  padding: 1.25rem;
}

.config-path {
  font-size: 0.82rem;
  color: #9ca3af;
  margin: 0 0 0.75rem;
  line-height: 1.4;
}

.config-path code {
  background: rgba(0, 245, 255, 0.08);
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  font-size: 0.78rem;
  color: #00f5ff;
}

.config-note {
  font-size: 0.78rem;
  color: #6b7280;
  margin: 0.75rem 0 0;
  line-height: 1.5;
}

.config-note strong {
  color: #fff;
}

.config-note code {
  background: rgba(0, 245, 255, 0.08);
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
  font-size: 0.75rem;
  color: #00f5ff;
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
  background: #050816;
  border: 1px solid #1a2740;
  border-radius: 6px;
  font-size: 0.8rem;
}

.val-label {
  display: block;
  color: #6b7280;
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
  color: #fff;
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
  color: #475569;
  font-size: 0.78rem;
}

/* ── Code blocks ── */
.code-block-wrap {
  position: relative;
  background: #050816;
  border: 1px solid #1a2740;
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
  color: #e6edf3;
  white-space: pre;
}

/* ── Copy button ── */
.btn-copy {
  padding: 0.25rem 0.6rem;
  background: transparent;
  border: 1px solid #1a2740;
  border-radius: 4px;
  color: #6b7280;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  cursor: pointer;
  flex-shrink: 0;
  transition: color 0.15s, border-color 0.15s;
}

.btn-copy:hover {
  color: #00f5ff;
  border-color: #00f5ff;
}

.btn-copy.copied {
  color: #3fb950;
  border-color: #3fb950;
}

.code-block-wrap .btn-copy {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
}
</style>

# Connecting to MCTL MCP Server

Connect your AI assistant to MCTL to manage infrastructure through natural language.

## Prerequisites

1. An MCTL account with access to a team workspace
2. An AI client that supports MCP (Claude, Cursor, VS Code, etc.)

## Setup

There are two ways to connect, depending on what your client supports.

**Sign in from the client (recommended).** Clients that implement MCP
authorization only need the server URL, `https://api.mctl.ai/mcp`. They
discover the sign-in endpoints, open the MCTL sign-in page in your browser,
and keep the session refreshed. Nothing is pasted into a config file.
Claude.ai and Claude Code work this way today; pick their tab below.

**Paste a token.** Clients that cannot complete the sign-in yet (Cursor,
VS Code, Windsurf and others below) take a bearer token in their config.
Use the token card below to get a pre-filled config.

<McpSetup />

## Verifying Connection

After connecting, try a simple command:

```
"Who am I on MCTL?"
```

This calls the `mctl_whoami` tool and returns your identity, organization, and tenant access.

## Token Types

MCTL accepts three token types. The API auto-detects the type:

| Token format | Type | How to get |
|---|---|---|
| No dots (e.g. `ghp_abc123`) | GitHub PAT | GitHub Settings > Tokens |
| 2 dots, external issuer | Dex JWT | SSO login at `ops.mctl.ai` |
| 2 dots, self-issued | OAuth JWT | OAuth flow on this page (sign in above) |

## Troubleshooting

See the [Troubleshooting](/reference/troubleshooting) page for common connection issues.

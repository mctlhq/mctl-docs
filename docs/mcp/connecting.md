# Connecting to MCTL MCP Server

Connect your AI assistant to MCTL to manage infrastructure through natural language.

## Prerequisites

1. A GitHub account with access to an MCTL organization
2. An AI client that supports MCP (Claude, Cursor, VS Code, etc.)

## Setup

Authenticate with GitHub and get a ready-to-use config for your client.

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
| 2 dots, self-issued | OAuth JWT | OAuth flow at `mctl.ai/mcp` |

## Troubleshooting

See the [Troubleshooting](/reference/troubleshooting) page for common connection issues.

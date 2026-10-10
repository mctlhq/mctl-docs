# Connecting to MCTL MCP Server

Connect your AI assistant to MCTL to manage infrastructure through natural language.

## Prerequisites

1. An MCTL account with access to a team workspace
2. An AI client that supports MCP (Claude, Cursor, VS Code, etc.)

## Setup

Give your client the server URL, `https://api.mctl.ai/mcp`, and nothing
else. Clients that implement MCP authorization discover the sign-in
endpoints, open the MCTL sign-in page in your browser, and keep the session
refreshed. Nothing is pasted into a config file. Claude.ai, Claude Code,
Claude Desktop, Cursor, VS Code and Gemini CLI work this way today; pick
their tab below. MCTL sign-in from Windsurf and Copilot CLI is not enabled
yet.

<McpSetup />

## Verifying Connection

After connecting, try a simple command:

```
"Who am I on MCTL?"
```

This calls the `mctl_whoami` tool and returns your identity, organization, and tenant access.

## Tokens

The token your client holds is issued by `mctl-api` when you sign in, and the
client refreshes it by itself. See [Authentication](/security/authentication)
for the flow.

## Troubleshooting

See the [Troubleshooting](/reference/troubleshooting) page for common connection issues.

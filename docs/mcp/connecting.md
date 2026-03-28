# Connecting to MCTL MCP Server

Connect your AI assistant to MCTL to manage infrastructure through natural language.

## Prerequisites

1. A GitHub account with access to an MCTL organization
2. An AI client that supports MCP (Claude, Cursor, VS Code, etc.)

## Claude.ai (Web)

The easiest way to connect is through the native Claude.ai MCP connector:

1. Visit [mctl.ai/mcp](https://mctl.ai/mcp)
2. Click **Connect with Claude.ai**
3. Sign in with GitHub when prompted
4. Authorize MCTL to connect to your Claude account
5. Start a new conversation in Claude.ai — MCTL tools will be available

## Claude Code (CLI)

Add the MCP server to your Claude Code configuration:

```json
{
  "mcpServers": {
    "mctl": {
      "type": "streamable-http",
      "url": "https://api.mctl.ai/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_TOKEN"
      }
    }
  }
}
```

Get your token by signing in at [mctl.ai/mcp](https://mctl.ai/mcp).

## Cursor

1. Open Cursor Settings > MCP
2. Add a new MCP server:
   - **Name**: `mctl`
   - **Type**: Streamable HTTP
   - **URL**: `https://api.mctl.ai/mcp`
   - **Headers**: `Authorization: Bearer YOUR_TOKEN`
3. Save and restart Cursor

## VS Code (Copilot MCP)

Add to your VS Code `settings.json`:

```json
{
  "mcp.servers": {
    "mctl": {
      "type": "streamable-http",
      "url": "https://api.mctl.ai/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_TOKEN"
      }
    }
  }
}
```

## Getting Your Token

1. Visit [mctl.ai/mcp](https://mctl.ai/mcp)
2. Sign in with GitHub
3. Your token will be displayed on the page
4. Copy and use it in the `Authorization` header

Tokens are GitHub-scoped and inherit your organization membership and permissions.

## Verifying Connection

After connecting, try a simple command:

```
"Who am I on MCTL?"
```

This calls the `mctl_whoami` tool and returns your identity, organization, and tenant access.

# MCP Server Overview

MCTL exposes a [Model Context Protocol](https://modelcontextprotocol.io) (MCP) server that lets AI assistants manage your infrastructure through natural language.

## What is MCP?

MCP is an open protocol that connects AI models to external tools and data sources. Instead of copy-pasting commands, you describe what you want in natural language and your AI assistant calls the appropriate tools.

## Server Details

| | |
|---|---|
| **Endpoint** | `https://api.mctl.ai/mcp` |
| **Transport** | Streamable HTTP (POST/GET) |
| **Auth** | OAuth 2.0 PKCE or Bearer token |
| **Tools** | 39 (21 read-only, 14 write, 4 destructive) |

## Capabilities

With the MCTL MCP server you can:

- **Manage tenants** — create, list, inspect, and delete tenants
- **Deploy services** — deploy, scale, rollback, and retire services
- **Monitor operations** — track async operations and workflows
- **Handle incidents** — list, inspect, acknowledge, and resolve incidents
- **Manage domains** — add, verify, and remove custom domains
- **Provision databases** — create databases with auto-configured secrets
- **Preview environments** — create and manage preview deployments
- **Resource management** — check usage, get sizing recommendations

## Tool Annotations

Every tool is annotated with its behavior:

| Annotation | Meaning |
|------------|---------|
| `readOnly` | Only reads data, no side effects |
| `destructive` | Modifies or deletes resources |

See the full [Tools Reference](/mcp/tools-reference) for details on each tool.

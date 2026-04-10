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

## What You Get

Once connected, your AI assistant can:

1. **Inspect platform state** — query services, tenants, resource usage, logs, and workflow status in real time
2. **Deploy and manage apps** — onboard, deploy, rollback, and preview services; create workspaces; provision databases
3. **Manage domains and scaling** — add custom domains with auto-TLS, configure autoscaling, verify DNS
4. **Full audit trail** — every write operation creates a git commit in the GitOps repo for complete traceability

## How Access Works

Authentication follows a three-step model:

1. **Token validated per request** — your GitHub token or OAuth credential is checked on every MCP call. The server never stores tokens.
2. **Team-scoped access** — access is limited to workspaces resolved from your GitHub team memberships in the GitOps repo. Admins can operate on all tenants.
3. **Full audit trail** — every write operation submits an Argo Workflow that produces a git commit. All changes are traceable and reversible.

For detailed auth information, see [Authentication](/security/authentication).

## Tool Annotations

Every tool is annotated with its behavior:

| Annotation | Meaning |
|------------|---------|
| `readOnly` | Only reads data, no side effects |
| `destructive` | Modifies or deletes resources |

See the full [Tools Reference](/mcp/tools-reference) for details on each tool.

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
| **Tools** | Discover the tools available to your account with MCP `tools/list` |

## Capabilities

With the MCTL MCP server you can:

- **Manage tenants** — create, list, inspect, and delete tenants
- **Deploy services** — deploy, scale, rollback, and retire services
- **Monitor operations** — track async operations and workflows
- **Handle incidents** — list, inspect, acknowledge, and resolve incidents
- **Manage domains** — add, verify, and remove custom domains
- **Provision databases** — create databases with auto-configured secrets
- **Preview environments** — create and manage preview deployments
- **Resource management** — check CPU and memory usage
- **Platform skill registry** — list, read, publish, deprecate, and enable/disable platform-wide skills per tenant

## What You Get

Once connected, your AI assistant can:

1. **Inspect platform state** — query services, tenants, resource usage, logs, and workflow status in real time
2. **Deploy and manage apps** — onboard, deploy, rollback, and preview services; create workspaces; provision databases
3. **Manage domains and scaling** — add custom domains with auto-TLS, configure autoscaling, verify DNS
4. **Operation tracking** — workflow-backed changes return a workflow name; other writes update their own registries or stores

## How Access Works

Authentication follows a three-step model:

1. **Token validated per request** — the access token your client received when you signed in is checked on every MCP call. OAuth refresh-token hashes are stored server-side; the client manages its session.
2. **Team-scoped access** — tenant membership and roles are checked against the configured authorization authority. See [Authorization](/security/authorization).
3. **Operation-specific effects** — deployments use workflows and GitOps; domain registration, incident acknowledgements and other registry writes follow their own paths. Destructive changes may not be reversible.

For detailed auth information, see [Authentication](/security/authentication).

## Tool Annotations

Every tool is annotated with its behavior:

| Annotation | Meaning |
|------------|---------|
| `readOnly` | Only reads data, no side effects |
| `write` | Creates or modifies resources (deploys, scaling, config changes) |
| `destructive` | Potentially destructive effects; client confirmation behavior varies |

See the full [Tools Reference](/mcp/tools-reference) for details on each tool.

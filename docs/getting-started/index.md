# Getting Started

MCTL is an AI-native infrastructure management platform. Choose your path based on how you want to interact with the platform.

## For AI Users (MCP)

Connect your AI assistant to MCTL and manage infrastructure through natural language.

1. **Sign in** at [mctl.ai/mcp](https://mctl.ai/mcp) with your GitHub account
2. **Connect** your AI client (Claude, Cursor, or VS Code) — see [Connecting](/mcp/connecting)
3. **Start managing** — ask your AI to list tenants, deploy services, check logs

```
"Show me all services in the production tenant"
"Deploy my-app from ghcr.io/myorg/my-app:1.0.0 to the staging tenant"
"What incidents are currently open?"
```

## For Platform Engineers

Use the REST API and GitOps workflows to integrate MCTL into your existing toolchain.

1. **Get API access** — authenticate via GitHub OAuth at [mctl.ai](https://mctl.ai)
2. **Explore the API** — see [REST API Reference](/api/)
3. **Set up GitOps** — configure your repos to deploy through ArgoCD

## For Team Leads

Create and manage your team's infrastructure through the developer portal.

1. **Create a tenant** at [mctl.ai](https://mctl.ai) or via MCP
2. **Invite your team** — grant GitHub repository access
3. **Deploy services** — use the portal at [app.mctl.ai](https://app.mctl.ai) or MCP tools

## Key Concepts

| Concept | Description |
|---------|-------------|
| **Tenant** | An isolated environment for a team with its own namespace, RBAC, and resource quotas |
| **Service** | A containerized application deployed and managed by MCTL |
| **Operation** | An async task (deploy, scale, rollback) tracked to completion |
| **MCP** | Model Context Protocol — connects AI assistants to your infrastructure |

## Next Steps

- [Platform Overview](/platform/overview) — understand how MCTL works
- [Architecture](/platform/architecture) — see how the components fit together
- [Tenant Management](/guides/tenants) — create your first tenant
- [MCP Tools Reference](/mcp/tools-reference) — browse all 39 available tools

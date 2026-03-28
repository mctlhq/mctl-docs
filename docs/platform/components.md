# Components

MCTL consists of five core components, each in its own repository.

## mctl-api

**Go REST API + MCP Server** — the central control plane.

- Handles all client requests (MCP tools, REST API)
- Authenticates via GitHub OAuth, Dex SSO, or OAuth JWT
- Submits Argo Workflows for write operations
- Tracks async operations and their status
- Exposes 39 MCP tools via Streamable HTTP at `api.mctl.ai/mcp`

| | |
|---|---|
| **URL** | [api.mctl.ai](https://api.mctl.ai) |
| **Language** | Go |
| **Image** | `ghcr.io/mctlhq/mctl-api` |
| **Repo** | [mctlhq/mctl-api](https://github.com/mctlhq/mctl-api) |

## mctl-web

**Landing page + MCP connector + documentation** — the public face of MCTL.

- Landing page at `mctl.ai`
- MCP OAuth connector at `mctl.ai/mcp`
- Tenant self-service creation form
- Cloudflare Worker for OAuth flows

| | |
|---|---|
| **URL** | [mctl.ai](https://mctl.ai) |
| **Language** | TypeScript (Nuxt) |
| **Image** | `ghcr.io/mctlhq/mctl-web` |
| **Repo** | [mctlhq/mctl-web](https://github.com/mctlhq/mctl-web) |

## mctl-gitops

**GitOps repository** — the single source of truth for all infrastructure.

- ArgoCD watches this repo and syncs cluster state
- Contains Helm values, Kustomize overlays, and raw manifests
- Tenant namespaces, services, and platform config all live here
- Every change to infrastructure is a Git commit

| | |
|---|---|
| **URL** | [ops.mctl.ai](https://ops.mctl.ai) (ArgoCD) |
| **Repo** | [mctlhq/mctl-gitops](https://github.com/mctlhq/mctl-gitops) |

## mctl-portal

**Backstage developer portal** — the UI for browsing and managing services.

- Service catalog with real-time status
- Tenant and team management
- Workflow and operation history
- Custom Backstage plugins for MCTL-specific functionality

| | |
|---|---|
| **URL** | [app.mctl.ai](https://app.mctl.ai) |
| **Language** | TypeScript (React) |
| **Image** | `ghcr.io/mctlhq/mctl-portal` |
| **Repo** | [mctlhq/mctl-portal](https://github.com/mctlhq/mctl-portal) |

## mctl-agent

**Self-healing agent** — automated incident response.

- Subscribes to AlertManager webhooks
- Creates tickets and stores incident state
- Analyzes alerts using Claude API plus builtin, YAML, and remote skills
- Executes skills (rollback, scale, restart, quota, probe, drift, etc.)
- Can dispatch incidents to external agents such as OpenClaw through signed webhooks
- Creates PRs to `mctl-gitops` with fixes and tracks PR metadata
- Notifies operators through Telegram for updates, review, and approvals
- Full incident lifecycle: detect, analyze, propose fix, review, verify

| | |
|---|---|
| **URL** | [agent.mctl.ai](https://agent.mctl.ai) |
| **Language** | Go |
| **Image** | `ghcr.io/mctlhq/mctl-agent` |
| **Repo** | [mctlhq/mctl-agent](https://github.com/mctlhq/mctl-agent) |

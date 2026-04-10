# FAQ

## General

**What is MCTL?**
MCTL is an AI-native infrastructure management platform that lets you control Kubernetes infrastructure through natural language, REST APIs, or a developer portal.

**Is MCTL open source?**
Yes. All repositories are licensed under Apache 2.0 and available on [GitHub](https://github.com/mctlhq).

**What AI clients are supported?**
Any client that supports the Model Context Protocol (MCP): Claude.ai, Claude Code, Cursor, VS Code with Copilot MCP, and others.

## MCP

**What can the AI do?**
Read platform state (services, logs, resource usage, workflows, incidents) and trigger operations (deploy, rollback, scale, create previews, manage domains, provision databases). See the [Tools Reference](/mcp/tools-reference) for all 39 tools.

**What can it NOT do?**
No direct kubectl access, no raw Vault reads, no cluster-level operations. Destructive tools (`mctl_retire_service`, `mctl_delete_tenant`, `mctl_remove_custom_domain`, `mctl_delete_preview`) are explicitly annotated and require AI client confirmation before execution.

**Where do write operations go?**
Every write operation submits an Argo Workflow that produces a git commit in the GitOps repository. ArgoCD detects the change and syncs it to the cluster. Use `mctl_get_workflow_status` to track progress.

**How does auth work for Claude.ai connector?**
GitHub OAuth with PKCE flow. Only `read:user` and `user:email` scopes are requested — no access to your code or repositories. The OAuth token is sent per-request and never stored server-side.

**Do I need to install anything?**
No for Claude.ai — use the native connector. For developer clients (Cursor, VS Code, Claude Desktop, etc.), add a one-time MCP server config with your GitHub token. See [Connecting](/mcp/connecting) for setup instructions.

**What GitHub token scope is needed?**
For developer clients: `read:user` and `user:email`. The simplest way is `gh auth token` from the GitHub CLI. For Claude.ai, no token management is needed — the connector handles auth via OAuth.

**How many tools are available?**
39 tools covering tenants, services, operations, incidents, domains, databases, previews, and resource optimization. See the [Tools Reference](/mcp/tools-reference).

## Platform

**What happens when I deploy a service?**
A commit is made to the GitOps repository, ArgoCD detects the change and syncs it to the cluster, and an Argo Workflow executes the deployment. You get an operation ID to track progress.

**Can I rollback a deployment?**
Yes. Use the `mctl_rollback_service` tool or API endpoint. Since every deployment is a Git commit, rollbacks are safe and auditable.

**How is tenant isolation enforced?**
Each tenant has its own Kubernetes namespace with RBAC policies, network policies, and resource quotas. Cross-tenant access is not possible.

<!-- TODO: Add more FAQ entries based on user questions -->

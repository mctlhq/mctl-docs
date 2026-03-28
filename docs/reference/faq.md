# FAQ

## General

**What is MCTL?**
MCTL is an AI-native infrastructure management platform that lets you control Kubernetes infrastructure through natural language, REST APIs, or a developer portal.

**Is MCTL open source?**
Yes. All repositories are licensed under Apache 2.0 and available on [GitHub](https://github.com/mctlhq).

**What AI clients are supported?**
Any client that supports the Model Context Protocol (MCP): Claude.ai, Claude Code, Cursor, VS Code with Copilot MCP, and others.

## MCP

**How do I get a token?**
Sign in at [mctl.ai/mcp](https://mctl.ai/mcp) with your GitHub account. Your token will be displayed on the page.

**Can I use MCP with Claude.ai directly?**
Yes. Use the native connector at [mctl.ai/mcp](https://mctl.ai/mcp) — no token management needed.

**How many tools are available?**
39 tools covering tenants, services, operations, incidents, domains, databases, previews, and more. See the [Tools Reference](/mcp/tools-reference).

## Platform

**What happens when I deploy a service?**
A commit is made to the GitOps repository, ArgoCD detects the change and syncs it to the cluster, and an Argo Workflow executes the deployment. You get an operation ID to track progress.

**Can I rollback a deployment?**
Yes. Use the `mctl_rollback_service` tool or API endpoint. Since every deployment is a Git commit, rollbacks are safe and auditable.

**How is tenant isolation enforced?**
Each tenant has its own Kubernetes namespace with RBAC policies, network policies, and resource quotas. Cross-tenant access is not possible.

<!-- TODO: Add more FAQ entries based on user questions -->

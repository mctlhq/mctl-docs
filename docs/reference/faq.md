# FAQ

## General

**What is MCTL?**
MCTL is an AI-native infrastructure management platform that lets you control Kubernetes infrastructure through natural language, REST APIs, or a developer portal.

**Is MCTL open source?**
The public platform repositories are available on [GitHub](https://github.com/mctlhq). Check each repository's LICENSE for its terms.

**What AI clients are supported?**
Any client that supports the Model Context Protocol (MCP): Claude.ai, Claude Code, Cursor, VS Code with Copilot MCP, and others.

## MCP

**What can the AI do?**
Read platform state (services, logs, resource usage, workflows, incidents) and trigger operations (deploy, rollback, scale, create previews, manage domains, provision databases). See the [Tools Reference](/mcp/tools-reference) for the catalog and discovery guidance.

**What can it NOT do?**
The MCP interface exposes specific operations rather than a general kubectl or Vault shell. Available actions depend on your role. Destructive annotations are client hints; server-side role and policy checks enforce access.

**Where do write operations go?**
Service deployment and configuration use workflows and GitOps. Other writes, such as domain registration and incident acknowledgements, update their own stores. Use the returned workflow name when an operation submits a workflow.

**How does auth work for Claude.ai connector?**
Standard MCP authorization: OAuth 2.1 with PKCE. Claude registers itself, you sign in on the MCTL sign-in page, and Claude receives a token issued by MCTL. You never handle a token yourself.

**Do I need to install anything?**
No for Claude.ai and Claude Desktop — use a custom connector. Claude Code, Cursor, VS Code and Gemini CLI need a one-time MCP server config with only the server URL; they open the MCTL sign-in page themselves. MCTL sign-in from Windsurf and Copilot CLI is not enabled yet. See [Connecting](/mcp/connecting) for setup instructions.

**Do I need a GitHub token?**
Not for an MCP client: every supported client signs in through MCTL from the server URL alone. CI deployment uses GitHub Actions OIDC, with no stored GitHub PAT; see [Scaffolding](/guides/scaffolding).

**How many tools are available?**
The catalog changes by release and caller permissions. Ask your client to refresh MCP `tools/list`. See the [Tools Reference](/mcp/tools-reference).

## Platform

**What happens when I deploy a service?**
The API submits a workflow which builds the image and updates GitOps. ArgoCD reconciles that configuration. Track the workflow, then check service sync/health and the application endpoint.

**Can I rollback a deployment?**
Yes. Use the `mctl_rollback_service` tool or API endpoint. Since every deployment is a Git commit, rollbacks are safe and auditable.

**How is tenant isolation enforced?**
Each tenant has its own Kubernetes namespace with RBAC policies, network policies, and resource quotas. The cluster remains shared; access follows configured policies and grants.

## Documentation site

**Which version of VitePress does this site use?**
mctl docs runs on VitePress 1.6. The decision to upgrade VitePress is tracked separately from this styling change. See [ADR 0003 — VitePress 2.x upgrade strategy](https://github.com/mctlhq/mctl-docs/blob/main/context/decisions/0003-vitepress-2-upgrade-strategy.md) for the full rationale and migration checklist.

<!-- TODO: Add more FAQ entries based on user questions -->

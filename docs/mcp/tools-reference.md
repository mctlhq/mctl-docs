# MCP Tools Reference

The MCTL MCP server exposes 39 tools for managing your infrastructure. Each tool is annotated as either **read-only** or **destructive**.

## Identity

| Tool | Description | Type |
|------|-------------|------|
| `mctl_whoami` | Check authentication status, user ID, team memberships, admin status, and accessible namespaces | Read |

## Tenants

| Tool | Description | Type |
|------|-------------|------|
| `mctl_list_tenants` | List all team workspaces with resource quotas and member counts (admin only) | Read |
| `mctl_get_tenant` | Get workspace details: members, quotas, and deployed services | Read |
| `mctl_create_tenant` | Create a new workspace with namespace, resource quotas, network policies, Vault scope, ArgoCD RBAC, and SSO access | Write |
| `mctl_delete_tenant` | Permanently delete a workspace and all its resources. Retires all services first | Destructive |

## Services

| Tool | Description | Type |
|------|-------------|------|
| `mctl_list_services` | List deployed services showing name, team, image tag, host, and database status. Optional team filter | Read |
| `mctl_get_service_status` | Get ArgoCD sync state, health status, and service configuration | Read |
| `mctl_get_service_config` | Get full configuration from GitOps: image tag, host, port, component type, database status | Read |
| `mctl_get_service_logs` | Fetch recent log lines from Loki, sorted by timestamp (most recent first) | Read |
| `mctl_get_resource_usage` | Get resource quota usage: CPU, memory, pods used vs allocated | Read |
| `mctl_deploy_service` | Deploy a service. Actions: "onboard" (first-time), "deploy" (update version), "update-config" (change env/secrets) | Write |
| `mctl_scale_service` | Update autoscaling: enable/disable HPA, set min/max replicas and CPU threshold | Write |
| `mctl_rollback_service` | Roll back to a previously deployed image tag via GitOps | Write |
| `mctl_retire_service` | Permanently remove a service: deletes GitOps manifests, Vault secrets, ArgoCD app, and K8s resources | Destructive |

## Operations & Workflows

| Tool | Description | Type |
|------|-------------|------|
| `mctl_list_operations` | List all available platform operations with parameters, risk levels, and descriptions | Read |
| `mctl_get_operation` | Get detailed schema of an operation: parameters, types, defaults, validation, risk level | Read |
| `mctl_list_recent_operations` | List most recent platform operations from audit log (up to 50 entries) | Read |
| `mctl_list_workflows` | List recent Argo Workflow runs for a team. Admins see all namespaces | Read |
| `mctl_get_workflow_status` | Get status and logs of an Argo Workflow run | Read |

## Incidents

| Tool | Description | Type |
|------|-------------|------|
| `mctl_list_incidents` | List incidents (AlertManager alerts, GitHub Actions failures, polling). Filter by team, service, status, severity | Read |
| `mctl_get_incident` | Get full incident details including evidence, analysis, and PR info. Accepts full ID or 8-char prefix | Read |
| `mctl_incident_summary` | Get aggregate counts of active incidents by status, severity, and type | Read |
| `mctl_acknowledge_incident` | Mark an incident as acknowledged. Records current user as acknowledger | Write |
| `mctl_resolve_incident` | Mark an incident as resolved with optional reason | Write |

## Domains

| Tool | Description | Type |
|------|-------------|------|
| `mctl_list_domains` | List custom domains for a team or service. Shows status (pending/verified/active) | Read |
| `mctl_verify_domain` | Check if a domain's CNAME record points to the expected target | Read |
| `mctl_add_custom_domain` | Add a custom domain to a deployed service. Triggers DNS verification and TLS provisioning | Write |
| `mctl_remove_custom_domain` | Remove a custom domain from a service. Auto-generated domain is not affected | Destructive |

## Databases

| Tool | Description | Type |
|------|-------------|------|
| `mctl_provision_database` | Provision PostgreSQL on shared CNPG cluster. Creates database/role, stores credentials in Vault and K8s Secret | Write |

## Preview Environments

| Tool | Description | Type |
|------|-------------|------|
| `mctl_list_previews` | List active previews with health status, sync state, and namespace | Read |
| `mctl_create_preview` | Deploy ephemeral preview from existing image tag. Auto-deleted after TTL (default: 24h) | Write |
| `mctl_delete_preview` | Remove a preview environment and all its K8s resources immediately | Destructive |

## Repositories

| Tool | Description | Type |
|------|-------------|------|
| `mctl_list_repos` | List GitHub repos available to a team. Admins see org + personal repos | Read |
| `mctl_grant_repo_access` | Generate GitHub App installation URL to grant platform access to a repo | Write |
| `mctl_sync_repos` | Discover and register GitHub repos from App installations for a team | Write |

## OpenClaw (Resource Optimization)

| Tool | Description | Type |
|------|-------------|------|
| `mctl_get_openclaw_sizing_recommendation` | Read VictoriaMetrics history and return recommended resource profile | Read |
| `mctl_deploy_openclaw` | Prepare self-service OpenClaw deployment. Returns Telegram bot-token intake URL | Write |
| `mctl_resume_openclaw_deploy` | Resume onboarding after bot token saved. Provisions database and submits deploy workflow | Write |
| `mctl_apply_openclaw_resource_profile` | Apply a named runtime profile (startup, steady-medium, steady-small) via GitOps | Write |

## Tool Annotations

Tools are annotated with behavior hints for AI clients:

- **Read** (`readOnly: true`) — safe to call without side effects
- **Write** — modifies resources, requires confirmation
- **Destructive** (`destructive: true`) — deletes resources, requires explicit confirmation

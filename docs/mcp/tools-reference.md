# MCP Tools Reference

The MCTL MCP server exposes 44 tools for managing your infrastructure. Each tool is annotated as either **read-only** or **destructive**.

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

## mctl-agents pipeline controls

> **Admin-only.** All tools in this section require membership in the `admins` group.
> Calls from non-admin users return `403 Forbidden`.
>
> _Version note: available as of mctl-api 4.15.0 (commit `016b3c8`) and 4.16.0 (`f41590e`).
> version-status: unverified — confirm against production before relying on this page._

The mctl platform runs a daily autonomous R&D pipeline (`mctl-agents`) that scans sibling
repos for changes, identifies documentation gaps, and writes spec proposals — one cycle per
service (researcher → analyst → spec-writer). A Tier 2 implementer can also convert accepted
proposals into pull requests automatically.

The five tools below let platform admins drive this pipeline on demand from any MCP-capable
client (e.g. Claude Desktop, Claude Code).

### Tool summary

| Tool | Purpose | Returns |
|---|---|---|
| `mctl_trigger_agents_run` | Full pipeline — all service-agents + mentor digest | `workflow_name` |
| `mctl_trigger_mentor_only` | Mentor weekly digest only | `workflow_name` |
| `mctl_trigger_single_service` | One service-agent cycle | `workflow_name` |
| `mctl_list_recent_agent_runs` | List ≤10 recent pipeline runs from audit log | JSON array |
| `mctl_trigger_implementer` | Tier 2: open PRs for accepted proposals | `workflow_name` |

---

### `mctl_trigger_agents_run`

Triggers a full mctl-agents run: every service-agent (researcher → analyst → spec-writer
in parallel) followed by the mentor weekly digest. Equivalent to the daily 06:00 UTC cron,
but on demand.

**Parameters:** none

**Cost / duration:** ~$10 against Claude subscription quota; ~15 minutes.

**Result:** A `chore(agents)` commit lands in `mctl-gitops` main under
`platform-gitops/agents-state/` with new inbox files, proposals, and updated `.status.yaml`
entries.

**Returns:** `workflow_name` string — use with `mctl_get_workflow_status` to track progress.

```
mctl_trigger_agents_run()
# → { "workflow_name": "mctl-agents-daily-abc12" }
```

---

### `mctl_trigger_mentor_only`

Runs only the mentor sub-agent, which reads all service inbox files from the past week and
produces a cross-service digest. Lighter than the full run.

**Parameters:** none

**Cost / duration:** ~$2, ~5 minutes.

**Returns:** `workflow_name`

---

### `mctl_trigger_single_service`

Runs the researcher → analyst → spec-writer cycle for a single service only.
Useful for spot-checking one repo after a significant release.

**Parameters:**

| Name | Type | Required | Description |
|---|---|---|---|
| `service` | string (enum) | yes | One of: `mctl-web`, `mctl-openclaw`, `mctl-docs`, `mctl-api`, `mctl-portal`, `mctl-agent`, `mctl-gitops` |

**Cost / duration:** ~$2–5, ~5–10 minutes.

**Returns:** `workflow_name`

**Example:**

```
mctl_trigger_single_service(service="mctl-docs")
# → { "workflow_name": "mctl-agents-single-xyz99" }
```

---

### `mctl_list_recent_agent_runs`

Returns up to 10 recent mctl-agents pipeline runs from the audit log, enriched with the
run mode and target service so you don't need to parse the workflow name.

**Parameters:** none

**Returns:** JSON object `{ "items": [...], "count": N }` where each item has:

| Field | Description |
|---|---|
| `workflowName` | Argo workflow name (use for status polling) |
| `operation` | Operation name (`mctl-agents-run`, `mctl-agents-implement`, …) |
| `mode` | Run mode (`full`, `mentor-only`, `single-service`) |
| `service` | Target service (empty for full/mentor runs) |
| `status` | Last known status (`running`, `succeeded`, `failed`) |
| `user` | Admin user ID who triggered the run |
| `timestamp` | ISO8601 start time |
| `riskLevel` | `high` for all mctl-agents triggers |
| `message` | Short status message |

---

### `mctl_trigger_implementer`

Triggers Tier 2 implementer agents. The implementer scans
`platform-gitops/agents-state/<service>/proposals/<slug>/.status.yaml` for entries with
`status: accepted`. For each accepted proposal it:

1. Clones the matching `mctlhq/<service>` repo.
2. Runs the per-service implementer sub-agent to make the change.
3. Pushes a `feat/agents-<slug>` branch and opens a PR.
4. Updates `.status.yaml` to `status: implemented` with the PR URL.

**Parameters:**

| Name | Type | Required | Description |
|---|---|---|---|
| `service` | string (enum) | no | Filter to one service. Leave empty to process all services. Same enum as `mctl_trigger_single_service`. |
| `slug` | string | no | Filter to one proposal slug (across services unless `service` is also set). |
| `force` | `"true"` \| `"false"` | no | Retry proposals stuck in `in-progress` (e.g. from a crashed run). Default `"false"`. |

**Cost / duration:** ~$3 per proposal; 1–10 minutes per proposal.

**Returns:** `workflow_name`

**Example — implement one specific proposal:**

```
mctl_trigger_implementer(service="mctl-docs", slug="mcp-agents-tools")
# → { "workflow_name": "mctl-agents-implement-abc34" }
```

---

### Status polling

All trigger tools return a `workflow_name`. Poll for progress with:

```
mctl_get_workflow_status(workflow_name="mctl-agents-daily-abc12")
```

Or check the last few runs at any time:

```
mctl_list_recent_agent_runs()
```

Results also appear as `chore(agents)` commits in the `mctl-gitops` repository under
`platform-gitops/agents-state/`.

---

## Tool Annotations

Tools are annotated with behavior hints for AI clients:

- **Read** (`readOnly: true`) — safe to call without side effects
- **Write** — modifies resources, requires confirmation
- **Destructive** (`destructive: true`) — deletes resources, requires explicit confirmation

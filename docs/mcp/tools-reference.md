# MCP Tools Reference

The catalog below was checked against the registered tools in
[`mctl-api` at `b8203cf`](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go).
The deployed version and your permissions determine the tools you can discover
and call. Use MCP `tools/list` for the current input schemas and annotations;
a catalog entry is not a grant of access. See [Authorization](/security/authorization).

Workflow-backed tools return submission information; poll the returned workflow
name and inspect service health separately. Registry, identity, incident and
commerce operations use their own stores and do not all produce Git commits.

## Registered tools

| Tool | Purpose | Hint |
|---|---|---|
| `mctl_whoami` | [Check Identity](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Read |
| `mctl_list_tenants` | [List Workspaces](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Read |
| `mctl_get_tenant` | [Get Workspace Details](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Read |
| `mctl_list_services` | [List Services](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Read |
| `mctl_get_service_status` | [Get Service Status](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Read |
| `mctl_get_service_config` | [Get Service Config](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Read |
| `mctl_list_workflows` | [List Workflows](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Read |
| `mctl_get_workflow_status` | [Get Workflow Status](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Read |
| `mctl_get_resource_usage` | [Get Resource Usage](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Read |
| `mctl_list_recent_operations` | [Recent Activity](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Read |
| `mctl_list_operations` | [List Operations](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Read |
| `mctl_get_operation` | [Get Operation Details](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Read |
| `mctl_list_repos` | [List Repositories](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Read |
| `mctl_grant_repo_access` | [Grant Repo Access](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Write |
| `mctl_get_service_logs` | [Get Service Logs](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Read |
| `mctl_get_workflow_logs` | [Get Workflow Step Logs](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Read |
| `mctl_list_previews` | [List Previews](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Read |
| `mctl_scale_service` | [Scale Service](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Write |
| `mctl_deploy_service` | [Deploy Service](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Write |
| `mctl_list_platform_skills` | [List Platform Skills](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Read |
| `mctl_read_platform_skill` | [Read Platform Skill](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Read |
| `mctl_list_tenant_skill_bindings` | [List Tenant Skill Bindings](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Read |
| `mctl_enable_tenant_skill` | [Enable Tenant Skill](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Write |
| `mctl_disable_tenant_skill` | [Disable Tenant Skill](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Destructive |
| `mctl_publish_platform_skill` | [Publish Platform Skill](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Write |
| `mctl_deprecate_platform_skill` | [Deprecate Platform Skill](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Destructive |
| `mctl_create_tenant` | [Create Workspace](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Write |
| `mctl_provision_database` | [Provision Database](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Write |
| `mctl_retire_service` | [Retire Service](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Destructive |
| `mctl_delete_tenant` | [Delete Workspace](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Destructive |
| `mctl_sync_repos` | [Sync Repositories](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Write |
| `mctl_rollback_service` | [Rollback Service](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Destructive |
| `mctl_create_preview` | [Create Preview](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Write |
| `mctl_delete_preview` | [Delete Preview](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Destructive |
| `mctl_add_custom_domain` | [Add Custom Domain](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Write |
| `mctl_remove_custom_domain` | [Remove Custom Domain](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Destructive |
| `mctl_list_domains` | [List Domains](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Read |
| `mctl_verify_domain` | [Verify Domain DNS](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Write |
| `mctl_erpact_list_sites` | [List ERPact Sites](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Read |
| `mctl_erpact_create_site` | [Create ERPact Site](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Write |
| `mctl_erpact_site_status` | [Get ERPact Site Status](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Read |
| `mctl_list_incidents` | [List Incidents](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Read |
| `mctl_get_incident` | [Get Incident Detail](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Read |
| `mctl_incident_summary` | [Incident Summary](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Read |
| `mctl_acknowledge_incident` | [Acknowledge Incident](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Write |
| `mctl_resolve_incident` | [Resolve Incident](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Write |
| `mctl_trigger_agents_run` | [Run mctl-agents (full)](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Write |
| `mctl_trigger_mentor_only` | [Run mctl-agents (mentor only)](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Write |
| `mctl_trigger_single_service` | [Run mctl-agents (single service)](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Write |
| `mctl_trigger_incident_responder` | [Run mctl-agents incident responder](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Write |
| `mctl_trigger_implementer` | [Run mctl-agents Tier 2 implementer](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Destructive |
| `mctl_trigger_shepherd` | [Run mctl-agents Tier 3 PR shepherd](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Destructive |
| `mctl_trigger_reconcile` | [Run mctl-agents reconcile sweep](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Destructive |
| `mctl_trigger_approve` | [Approve mctl-agents proposal](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Destructive |
| `mctl_trigger_issue` | [Run mctl-agents issue-investigator](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Write |
| `mctl_approve_dev_loop` | [Approve a DevLoopWorkflow](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Write |
| `mctl_abandon_dev_loop` | [Abandon a DevLoopWorkflow](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Destructive |
| `mctl_get_dev_loop` | [Describe a DevLoopWorkflow](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Read |
| `mctl_get_lifecycle_ownership` | [Read lifecycle ownership](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/lifecycle.go) | Read |
| `mctl_inspect_lifecycle_conflict` | [Inspect lifecycle recovery conflict](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/lifecycle_recovery.go) | Read |
| `mctl_request_lifecycle_reconcile` | [Request lifecycle reconciliation](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/lifecycle_recovery.go) | Write |
| `mctl_fence_lifecycle_claim` | [Fence a dead lifecycle claim](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/lifecycle_recovery.go) | Destructive |
| `mctl_request_lifecycle_handoff` | [Request a lifecycle handoff off a stuck owner](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/lifecycle_recovery.go) | Destructive |
| `mctl_retry_lifecycle_handoff` | [Retry a stalled lifecycle handoff](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/lifecycle_recovery.go) | Write |
| `mctl_list_recent_agent_runs` | [Recent mctl-agents runs](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Read |
| `mctl_get_epic_status` | [Roadmap epic status](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/roadmap.go) | Read |
| `mctl_get_ready_work_items` | [Ready roadmap work items](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/roadmap.go) | Read |
| `mctl_plan_epic_wave` | [Plan a roadmap epic wave](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/roadmap_wave.go) | Read |
| `mctl_start_epic_wave` | [Start a planned roadmap epic wave](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/roadmap_wave.go) | Write |
| `mctl_get_work_item` | [Work item](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/workitems.go) | Read |
| `mctl_list_work_item_executions` | [Work item executions](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/workitems.go) | Read |
| `mctl_list_work_item_snapshots` | [Work item context snapshots](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/workitems.go) | Read |
| `mctl_list_work_item_execution_requests` | [Work item execution requests](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/workitems.go) | Read |
| `mctl_request_work_item_execution` | [Request a work item execution](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/workitems.go) | Write |
| `mctl_get_commerce_budget` | [Commerce budget balance](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/commerce.go) | Read |
| `mctl_list_commerce_invocations` | [Commerce invocations](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/commerce.go) | Read |
| `mctl_get_commerce_receipt` | [Commerce receipt](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/commerce.go) | Read |
| `mctl_trigger_portal_server_auth_apply` | [Apply Cloudflare MCP portal server auth](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Write |
| `mctl_create_agent` | [Create Agent Definition](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Write |
| `mctl_publish_agent_version` | [Publish Agent Version](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Write |
| `mctl_list_agent_versions` | [List Agent Versions](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Read |
| `mctl_resolve_agent` | [Resolve Agent Release](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Read |
| `mctl_promote_agent` | [Promote Agent Version](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Destructive |
| `mctl_rollback_agent` | [Rollback Agent Release](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Destructive |
| `mctl_list_agent_executions` | [List Agent Executions](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Read |
| `mctl_publish_agent_definition_version` | [Publish Agent Definition Version](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Write |
| `mctl_publish_agent_profile_version` | [Publish Agent Execution Profile Version](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Write |
| `mctl_set_agent_version_lifecycle` | [Set Agent Version Lifecycle](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Destructive |
| `mctl_bind_agent_release` | [Bind Agent Release (v1alpha2)](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Destructive |
| `mctl_rollback_agent_binding` | [Rollback Agent Binding (v1alpha2)](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Destructive |
| `mctl_list_agents` | [List Agents](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Read |
| `mctl_get_agent` | [Get Agent](https://github.com/mctlhq/mctl-api/blob/b8203cfa23a5371e587754a03521d0906fc9bf7a/internal/mcp/server.go) | Read |

## Deployment parameters

### `mctl_deploy_service`

Deploys or reconfigures a service. The `action` parameter selects the mode:

| Action | Purpose |
|---|---|
| `onboard` | First-time deploy — creates the GitOps manifests and submits the initial build + deploy workflow |
| `deploy` | Update an already-onboarded service to a new image tag |
| `update-config` | Change environment variables or secrets without a new image build |

**Parameters** (not all apply to every action; see [Deploy your first app](/guides/deploy-first-app) for the full onboard walkthrough):

| Name | Applies to | Description |
|---|---|---|
| `team_name` | all | Tenant name |
| `component_name` | all | Service name — used in the generated URL |
| `dockerfile_repo` | onboard, deploy | GitHub repository in `<owner>/<repo>` format |
| `dockerfile_path` | onboard | Path to the Dockerfile if not at the repo root. Defaults to `"Dockerfile"` |
| `git_tag` | onboard, deploy | Git tag to build/deploy |
| `port` | onboard | Container port the app listens on |
| `service_template` | onboard | Use `"default"` unless a custom template applies |
| `health_check_path` | onboard | Overrides both liveness and readiness probe paths. When omitted, the chart uses `/healthz` for liveness and `/readyz` for readiness. Only applied at onboard time; not currently supported on `update-config` |
| `secret_env_vars` | update-config | String of newline-separated `KEY=value` entries to store in Vault (see below) |
| `env_vars` | update-config | String of newline-separated `KEY=value` entries for plain, non-secret env vars |

Pass `env_vars` and `secret_env_vars` as strings, not JSON objects. Omit a parameter
to leave it unchanged. An explicitly empty string clears the corresponding
configuration; do not use it as a placeholder.

**How `update-config` with `secret_env_vars` actually works:**

This is not instant — it's a three-step chain, and each step has its own propagation delay:

1. The value is written to Vault under the tenant's secret path.
2. An `ExternalSecret` is created/updated in the tenant namespace. The External
   Secrets Operator syncs it into a Kubernetes `Secret` — this sync is not
   immediate; check the `ExternalSecret`'s status if the value hasn't landed
   yet.
3. The Kubernetes `Secret` is wired into the pod via `envFrom`. `update-config`
   triggers a rollout for you, but a running pod will not see the new value
   until it restarts.

If a secret isn't reaching your app, check in order: the `ExternalSecret`
synced (the `Secret` exists in-namespace) → the Deployment's `envFrom`
references that `Secret` → the pod actually restarted after the update.

**Example:**

```
mctl_deploy_service(
  action="update-config",
  team_name="my-team",
  component_name="my-service",
  secret_env_vars="API_KEY=example-secret"
)
```

---


## Tool annotations

`readOnlyHint`, `destructiveHint` and `idempotentHint` describe tool behavior.
They are hints to clients, not authorization checks or a guarantee that a client
will request confirmation. The API enforces membership, roles and operation policy.
Platform pipeline tools are admin-only. Tenant and owner restrictions still apply
even when a client exposes a tool in its interface.

## Agent pipelines

Use each tool's current schema for service filters and execution bounds.
Proposals and PRs follow the platform review/approval gates; approval belongs to
the current proposal or commit and must not be assumed from an earlier run.
Pipeline duration and model cost depend on the work and configured runner.

# REST API

The MCTL REST API is served by `mctl-api` at `api.mctl.ai`. All operations available through MCP tools are also available as REST endpoints.

## Base URL

```
https://api.mctl.ai
```

## Authentication

Include an `Authorization` header with every request to `/api/v1/*` endpoints:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" https://api.mctl.ai/api/v1/tenants
```

Two token types are accepted:

| Type | Format | Validation |
|------|--------|------------|
| **GitHub PAT** | `ghp_xxxx...` (no dots) | Validated against GitHub API; requires `read:user` scope |
| **Dex JWT** | `eyJhbG...` (2 dots, external issuer) | Verified via JWKS at `ops.mctl.ai/api/dex/keys` |
| **OAuth JWT** | `eyJhbG...` (2 dots, self-issued) | HMAC-SHA256 verification; issued via OAuth 2.0 PKCE flow |

See [Authentication](/security/authentication) for details.

## Rate Limits

| Endpoint type | Limit |
|---------------|-------|
| Read (`GET`) | 100 requests/minute per user |
| Write (`POST /execute`) | 20 requests/minute per user |

## Response Format

All responses are JSON. Errors return:

```json
{ "error": "description of the error" }
```

## OpenAPI Specification

The full OpenAPI 3.0 spec is available at:
- **YAML**: [api.mctl.ai/openapi.yaml](https://api.mctl.ai/openapi.yaml)
- **Swagger UI**: [api.mctl.ai/docs](https://api.mctl.ai/docs)

---

## Health

### `GET /healthz`

Returns 200 if the server is running. No authentication required.

**Response** `200`
```json
{ "status": "ok" }
```

### `GET /readyz`

Returns 200 if the server is ready to handle traffic. No authentication required.

---

## Tenants

### `GET /api/v1/tenants`

List all team workspaces. **Admin access required.**

**Response** `200`
```json
{
  "items": [
    {
      "name": "billing",
      "displayName": "Billing Team",
      "description": "Handles payment processing",
      "contactEmail": "billing@example.com",
      "quotas": { "cpu": "2", "memory": "4Gi", "pods": "10" },
      "members": [
        { "userId": "alice", "role": "admin" }
      ]
    }
  ],
  "count": 1
}
```

| Status | Description |
|--------|-------------|
| `200` | List of tenants |
| `403` | Admin access required |

### `GET /api/v1/tenants/{name}`

Get a specific tenant with its deployed services.

**Parameters**

| Name | In | Required | Description |
|------|----|----------|-------------|
| `name` | path | yes | Tenant name (e.g. `billing`) |

**Response** `200`
```json
{
  "tenant": {
    "name": "billing",
    "displayName": "Billing Team",
    "quotas": { "cpu": "2", "memory": "4Gi", "pods": "10" },
    "members": [{ "userId": "alice", "role": "admin" }]
  },
  "services": [
    {
      "team": "billing",
      "name": "payment-api",
      "imageTag": "1.2.3",
      "host": "payment-api.mctl.ai",
      "port": "8080",
      "componentType": "base-service",
      "hasDatabase": true
    }
  ]
}
```

| Status | Description |
|--------|-------------|
| `200` | Tenant details with services |
| `404` | Tenant not found |

---

## Services

### `GET /api/v1/services`

List all deployed services. Optionally filter by team.

**Parameters**

| Name | In | Required | Description |
|------|----|----------|-------------|
| `team` | query | no | Filter by team name |

**Response** `200`
```json
{
  "items": [
    {
      "team": "billing",
      "name": "payment-api",
      "imageTag": "1.2.3",
      "host": "payment-api.mctl.ai",
      "port": "8080",
      "componentType": "base-service",
      "hasDatabase": true
    }
  ],
  "count": 1
}
```

### `GET /api/v1/services/{team}/{app}`

Get full GitOps configuration for a service.

**Parameters**

| Name | In | Required | Description |
|------|----|----------|-------------|
| `team` | path | yes | Team name |
| `app` | path | yes | Service name |

**Response** `200`
```json
{
  "team": "billing",
  "name": "payment-api",
  "imageTag": "1.2.3",
  "host": "payment-api.mctl.ai",
  "port": "8080",
  "componentType": "base-service",
  "hasDatabase": true
}
```

| Status | Description |
|--------|-------------|
| `200` | Service configuration |
| `404` | Service not found |

### `GET /api/v1/status/{team}/{app}`

Get live ArgoCD sync and health status for a service.

**Parameters**

| Name | In | Required | Description |
|------|----|----------|-------------|
| `team` | path | yes | Team name |
| `app` | path | yes | Service name |

**Response** `200`
```json
{
  "argocd": {
    "name": "billing-payment-api",
    "syncStatus": "Synced",
    "healthStatus": "Healthy",
    "message": ""
  },
  "service": {
    "team": "billing",
    "name": "payment-api",
    "imageTag": "1.2.3",
    "host": "payment-api.mctl.ai"
  }
}
```

**Possible `syncStatus` values**: `Synced`, `OutOfSync`, `Unknown`

**Possible `healthStatus` values**: `Healthy`, `Progressing`, `Degraded`, `Suspended`, `Missing`, `Unknown`

| Status | Description |
|--------|-------------|
| `200` | Service status |
| `404` | ArgoCD application not found |

### `GET /api/v1/logs/{team}/{app}`

Fetch recent log lines from Loki.

**Parameters**

| Name | In | Required | Default | Description |
|------|----|----------|---------|-------------|
| `team` | path | yes | | Team name |
| `app` | path | yes | | Service name |
| `lines` | query | no | `100` | Number of log lines (max 1000) |
| `since` | query | no | `1h` | Time window (e.g. `15m`, `1h`, `6h`, `24h`) |

**Response** `200`
```json
{
  "team": "billing",
  "app": "payment-api",
  "lines": [
    {
      "timestamp": "2026-03-31T12:00:00Z",
      "line": "INFO: Request processed in 42ms",
      "labels": { "pod": "payment-api-7d8f9-abc12" }
    }
  ],
  "count": 1,
  "note": "Showing 1 lines from last 1h"
}
```

| Status | Description |
|--------|-------------|
| `200` | Log lines |
| `404` | Service or tenant not found |

---

## Resources

### `GET /api/v1/resources/{tenant}`

Get resource quota allocation and live usage for a tenant namespace.

**Parameters**

| Name | In | Required | Description |
|------|----|----------|-------------|
| `tenant` | path | yes | Tenant name |

**Response** `200`
```json
{
  "tenant": "billing",
  "allocated": { "cpu": "2", "memory": "4Gi", "pods": "10" },
  "used": { "cpu": "0.5", "memory": "1.2Gi", "pods": "3" },
  "note": ""
}
```

| Status | Description |
|--------|-------------|
| `200` | Resource usage |
| `404` | Tenant not found |

---

## Workflows

### `GET /api/v1/workflows/{name}`

Get the status and audit log entry for an Argo Workflow.

**Parameters**

| Name | In | Required | Description |
|------|----|----------|-------------|
| `name` | path | yes | Workflow name (e.g. `deploy-service-abc12`) |

**Response** `200`
```json
{
  "workflow": "deploy-service-abc12",
  "audit": {
    "id": "a1b2c3d4",
    "timestamp": "2026-03-31T12:00:00Z",
    "userId": "alice",
    "operation": "deploy-service",
    "parameters": {
      "team_name": "billing",
      "component_name": "payment-api",
      "git_tag": "1.2.3"
    },
    "workflowName": "deploy-service-abc12",
    "status": "succeeded",
    "riskLevel": "medium",
    "message": ""
  },
  "note": ""
}
```

**Possible `status` values**: `submitted`, `succeeded`, `failed`

---

## Audit

### `GET /api/v1/audit`

List the most recent 50 audit log entries.

**Response** `200`
```json
{
  "items": [
    {
      "id": "a1b2c3d4",
      "timestamp": "2026-03-31T12:00:00Z",
      "userId": "alice",
      "operation": "deploy-service",
      "parameters": { "team_name": "billing" },
      "workflowName": "deploy-service-abc12",
      "status": "succeeded",
      "riskLevel": "medium"
    }
  ],
  "count": 1
}
```

---

## Repositories

### `GET /api/v1/repos`

List GitHub repositories available to a team.

**Parameters**

| Name | In | Required | Description |
|------|----|----------|-------------|
| `team` | query | yes | Team name |

### `POST /api/v1/repos/sync`

Discover and register GitHub repositories from App installations.

**Request Body**
```json
{
  "team": "billing",
  "user": "alice"
}
```

---

## Operations

### `GET /api/v1/operations`

List all registered platform operations with their parameter definitions.

**Response** `200`
```json
{
  "items": [
    {
      "name": "deploy-service",
      "displayName": "Deploy Service",
      "description": "Build image and deploy or update a service",
      "workflowTemplate": "deploy-service",
      "riskLevel": "medium",
      "requiresConfirm": false,
      "parameters": [
        {
          "name": "team_name",
          "type": "string",
          "required": true,
          "description": "Target tenant name"
        }
      ]
    }
  ],
  "count": 8
}
```

### `GET /api/v1/operations/{name}`

Get the parameter definitions and metadata for a specific operation.

**Parameters**

| Name | In | Required | Description |
|------|----|----------|-------------|
| `name` | path | yes | Operation name (e.g. `deploy-service`) |

| Status | Description |
|--------|-------------|
| `200` | Operation definition |
| `404` | Operation not found |

### `POST /api/v1/operations/{name}/execute`

Execute a platform operation. Submits an Argo Workflow and returns a workflow name for tracking.

**Rate limit**: 20 requests/minute per user.

**Parameters**

| Name | In | Required | Description |
|------|----|----------|-------------|
| `name` | path | yes | Operation name |

**Available operations**

| Name | Description | Risk |
|------|-------------|------|
| `deploy-service` | Build image and deploy/update service | medium |
| `create-tenant` | Create new team workspace | medium |
| `provision-database` | Provision PostgreSQL database | medium |
| `retire-service` | Permanently remove a service | high |
| `delete-tenant` | Delete team workspace | high |
| `rollback-service` | Roll back to a previous image tag | medium |
| `preview-deploy` | Deploy ephemeral preview environment | low |
| `preview-delete` | Remove preview environment | low |

**Request examples**

::: code-group
```json [Deploy a service]
{
  "team_name": "billing",
  "component_name": "payment-api",
  "action": "deploy",
  "git_tag": "1.2.3",
  "dockerfile_repo": "mctlhq/payment-api"
}
```

```json [Update config]
{
  "team_name": "billing",
  "component_name": "payment-api",
  "action": "update-config",
  "env_vars": "LOG_LEVEL=debug\nTIMEOUT=30"
}
```

```json [Rollback]
{
  "team_name": "billing",
  "component_name": "payment-api",
  "target_tag": "1.1.0"
}
```

```json [Preview]
{
  "team_name": "billing",
  "component_name": "payment-api",
  "image_tag": "1.2.3",
  "ttl_hours": "4"
}
```
:::

**Response** `200`
```json
{
  "workflowName": "deploy-service-abc12",
  "operation": "deploy-service",
  "status": "submitted",
  "message": "Workflow submitted successfully"
}
```

| Status | Description |
|--------|-------------|
| `200` | Workflow submitted |
| `400` | Invalid parameters |
| `403` | Access denied to this tenant |
| `404` | Operation not found |

---

## MCP Endpoint

In addition to the REST API, all operations are available as MCP tools:

```
POST https://api.mctl.ai/mcp
```

See [MCP Overview](/mcp/overview) and [Tools Reference](/mcp/tools-reference) for details.

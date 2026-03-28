# Architecture

MCTL follows a GitOps architecture where every infrastructure change flows through Git.

## System Diagram

```mermaid
graph TB
    subgraph Clients
        Claude["Claude / Cursor / VS Code"]
        Portal["Developer Portal\napp.mctl.ai"]
        API_Client["REST API Clients"]
    end

    subgraph "Control Plane"
        MCP["MCP Server\nStreamable HTTP"]
        API["mctl-api\napi.mctl.ai"]
        Agent["mctl-agent\nSelf-Healing"]
    end

    subgraph "GitOps"
        GitOps["mctl-gitops\nSource of Truth"]
        ArgoCD["ArgoCD\nops.mctl.ai"]
    end

    subgraph "Kubernetes Cluster"
        NS1["Tenant Namespace A"]
        NS2["Tenant Namespace B"]
        NS3["Platform Services"]
    end

    subgraph "External"
        GitHub["GitHub OAuth"]
        Dex["Dex SSO"]
        AlertManager["AlertManager"]
    end

    Claude -->|MCP Protocol| MCP
    Portal -->|REST| API
    API_Client -->|REST| API
    MCP --> API

    API -->|Commits| GitOps
    Agent -->|PRs| GitOps
    GitOps -->|Sync| ArgoCD
    ArgoCD -->|Apply| NS1
    ArgoCD -->|Apply| NS2
    ArgoCD -->|Apply| NS3

    GitHub -->|Auth| API
    Dex -->|SSO| API
    AlertManager -->|Alerts| Agent
```

## Request Flow

### MCP Request

1. AI client sends a tool call via Streamable HTTP to `api.mctl.ai/mcp`
2. `mctl-api` authenticates the request (GitHub token, Dex JWT, or OAuth JWT)
3. The handler validates input and checks RBAC for the tenant
4. A Git commit is created in `mctl-gitops` with the desired state
5. An operation ID is returned immediately
6. ArgoCD detects the change and syncs the cluster
7. An Argo Workflow runs to execute the operation
8. The client can poll the operation status until completion

### Self-Healing Flow

1. AlertManager fires an alert (e.g., pod crash loop)
2. `mctl-agent` receives the alert webhook
3. The agent analyzes the alert using Claude API
4. A skill is selected and executed (e.g., increase memory, rollback)
5. A PR is created in `mctl-gitops` with the fix
6. On merge, ArgoCD syncs the change

## Data Flow

| Path | Protocol | Auth |
|------|----------|------|
| Client -> MCP Server | Streamable HTTP (POST/GET) | Bearer token per request |
| Client -> REST API | HTTPS | GitHub token / Dex JWT / OAuth JWT |
| API -> GitOps | Git (SSH) | Deploy key |
| ArgoCD -> Cluster | Kubernetes API | ServiceAccount |
| AlertManager -> Agent | Webhook (HTTP) | Internal network |

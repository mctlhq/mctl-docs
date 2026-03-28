# Architecture

MCTL follows a GitOps architecture where every infrastructure change flows through Git.

## System Diagram

```mermaid
graph TB
    classDef clients fill:#0f1d2e,stroke:#38bdf8,color:#f8fafc,stroke-width:1.5px
    classDef control fill:#102234,stroke:#00f5ff,color:#ffffff,stroke-width:2px
    classDef gitops fill:#11281f,stroke:#34d399,color:#f8fafc,stroke-width:2px
    classDef cluster fill:#20172e,stroke:#a78bfa,color:#f8fafc,stroke-width:1.5px
    classDef external fill:#261b14,stroke:#fb923c,color:#f8fafc,stroke-width:1.5px

    subgraph Clients
        clientClaude["Claude / Cursor / VS Code"]
        clientPortal["Developer Portal\napp.mctl.ai"]
        clientApi["REST API Clients"]
    end

    subgraph "Control Plane"
        controlMcp["MCP Server\nStreamable HTTP"]
        controlApi["mctl-api\napi.mctl.ai"]
        controlAgent["mctl-agent\nSelf-Healing"]
    end

    subgraph "GitOps"
        gitopsRepo["mctl-gitops\nSource of Truth"]
        gitopsArgo["ArgoCD\nops.mctl.ai"]
    end

    subgraph "Kubernetes Cluster"
        clusterNsA["Tenant Namespace A"]
        clusterNsB["Tenant Namespace B"]
        clusterPlatform["Platform Services"]
    end

    subgraph "External"
        externalGithub["GitHub OAuth"]
        externalDex["Dex SSO"]
        externalAlertmanager["AlertManager"]
    end

    class clientClaude,clientPortal,clientApi clients
    class controlMcp,controlApi,controlAgent control
    class gitopsRepo,gitopsArgo gitops
    class clusterNsA,clusterNsB,clusterPlatform cluster
    class externalGithub,externalDex,externalAlertmanager external

    clientClaude -->|MCP Protocol| controlMcp
    clientPortal -->|REST| controlApi
    clientApi -->|REST| controlApi
    controlMcp --> controlApi

    controlApi -->|Commits| gitopsRepo
    controlAgent -->|PRs| gitopsRepo
    gitopsRepo -->|Sync| gitopsArgo
    gitopsArgo -->|Apply| clusterNsA
    gitopsArgo -->|Apply| clusterNsB
    gitopsArgo -->|Apply| clusterPlatform

    externalGithub -->|Auth| controlApi
    externalDex -->|SSO| controlApi
    externalAlertmanager -->|Alerts| controlAgent
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

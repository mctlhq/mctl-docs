# Architecture

MCTL follows a GitOps architecture where every infrastructure change flows through Git.

## System Diagram

```mermaid
graph TB
    classDef core fill:#102234,stroke:#00f5ff,color:#ffffff,stroke-width:2px
    classDef delivery fill:#11281f,stroke:#34d399,color:#f8fafc,stroke-width:2px
    classDef muted fill:#101827,stroke:#475569,color:#e6edf3,stroke-width:1.2px

    subgraph Clients
        clientClaude["Claude / Cursor / VS Code"]
        clientPortal["Developer Portal\napp.mctl.ai"]
        clientApi["REST API Clients"]
    end

    subgraph "Control Plane"
        controlMcp["MCP Server\nStreamable HTTP"]
        controlApi["mctl-api\napi.mctl.ai\naccepts requests + returns status"]
        controlAgent["mctl-agent\nSelf-Healing"]
        controlWorkflows["Argo Workflows\nworkflows.mctl.ai\nasync operations"]
    end

    subgraph "Delivery Plane"
        gitopsRepo["mctl-gitops\nSource of Truth\ncommitted desired state"]
        gitopsArgo["ArgoCD\nops.mctl.ai"]
    end

    subgraph "Kubernetes Cluster"
        clusterPlatform["Platform Services"]
        clusterTenants["Tenant Namespaces"]
    end

    subgraph "External"
        externalGithub["GitHub OAuth / Token"]
        externalDex["Dex SSO / JWT"]
        externalAlertmanager["AlertManager"]
    end

    class controlMcp,controlApi,controlAgent,controlWorkflows core
    class gitopsRepo,gitopsArgo delivery
    class clientClaude,clientPortal,clientApi,clusterPlatform,clusterTenants,externalGithub,externalDex,externalAlertmanager muted

    clientClaude -->|MCP Protocol| controlMcp
    clientPortal -->|REST| controlApi
    clientApi -->|REST| controlApi
    controlMcp --> controlApi

    controlApi -->|Submits ops| controlWorkflows
    controlWorkflows -->|Commits| gitopsRepo
    controlAgent -->|PRs| gitopsRepo
    gitopsRepo -->|Sync| gitopsArgo
    gitopsArgo --> clusterPlatform
    gitopsArgo --> clusterTenants
    controlWorkflows -->|Executes jobs| clusterPlatform
    gitopsArgo -. health / sync .-> controlApi
    controlWorkflows -. workflow status .-> controlApi

    externalGithub -. auth .-> controlApi
    externalDex -. sso .-> controlApi
    externalAlertmanager -. alerts .-> controlAgent
```

## Request Flow

### MCP Request

1. AI client sends a tool call via Streamable HTTP to `api.mctl.ai/mcp`
2. `mctl-api` authenticates the request (GitHub token, Dex JWT, or OAuth JWT)
3. The handler validates input and checks RBAC for the tenant
4. `mctl-api` submits an Argo Workflow for the requested operation
5. An operation ID is returned immediately
6. The workflow commits the desired state to `mctl-gitops`
7. ArgoCD detects the change and syncs the cluster
8. The client polls `mctl-api` for current workflow and sync status

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
| Argo Workflows -> GitOps | Git (SSH) | Deploy key |
| ArgoCD -> Cluster | Kubernetes API | ServiceAccount |
| AlertManager -> Agent | Webhook (HTTP) | Internal network |

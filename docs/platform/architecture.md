# Architecture

MCTL follows a GitOps architecture where every infrastructure change flows through Git.

## System Diagram

```mermaid
graph TB
    classDef core fill:#102234,stroke:#00f5ff,color:#ffffff,stroke-width:2px
    classDef delivery fill:#11281f,stroke:#34d399,color:#f8fafc,stroke-width:2px
    classDef muted fill:#101827,stroke:#475569,color:#e6edf3,stroke-width:1.2px

    subgraph Clients
        direction LR
        clientClaude["Claude / Cursor / VS Code"]
        clientPortal["Developer Portal UI"]
        clientApi["REST API Clients"]
    end

    subgraph "Control Plane"
        direction TB
        controlMcp["MCP Server\nStreamable HTTP"]
        controlApi["Developer Portal\napp.mctl.ai\naccepts requests + returns status"]
        subgraph controlAutomation["Automation"]
            direction LR
            controlAgent["mctl-agent\ntickets + skills + dispatch"]
            controlWorkflows["Argo Workflows\nworkflows.mctl.ai\nasync operations"]
        end
        controlExternal["External agents\nclaim + result callbacks"]
    end

    subgraph "Delivery Plane"
        direction LR
        gitopsRepo["mctl-gitops\nSource of Truth\ncommitted desired state"]
        gitopsArgo["ArgoCD\nops.mctl.ai"]
    end

    subgraph "Kubernetes Cluster"
        direction LR
        clusterAlerts["AlertManager"]
        clusterPlatform["Platform Services"]
        clusterTenants["Tenant Namespaces"]
    end

    class controlMcp,controlApi,controlAgent,controlWorkflows core
    class gitopsRepo,gitopsArgo delivery
    class clientClaude,clientPortal,clientApi,clusterPlatform,clusterAlerts,clusterTenants,controlExternal muted

    clientClaude -->|MCP Protocol| controlMcp
    clientPortal -->|REST| controlApi
    clientApi -->|REST| controlApi
    controlMcp --> controlApi

    controlApi -->|Submits ops| controlWorkflows
    controlWorkflows -->|Commits| gitopsRepo
    controlAgent -->|PRs| gitopsRepo
    controlAgent -. incident webhooks .-> controlExternal
    controlExternal -. claims / results .-> controlAgent
    gitopsRepo -->|Sync| gitopsArgo
    gitopsArgo --> clusterPlatform
    gitopsArgo --> clusterTenants
    controlWorkflows -. provisioning / platform jobs .-> clusterPlatform
    gitopsArgo -. deployment sync / health .-> controlApi
    controlWorkflows -. workflow execution status .-> controlApi

    clusterAlerts -. alerts .-> controlAgent

    click controlApi href "https://app.mctl.ai" "Open app.mctl.ai"
    click controlWorkflows href "https://workflows.mctl.ai" "Open workflows.mctl.ai"
    click gitopsArgo href "https://ops.mctl.ai" "Open ops.mctl.ai"
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
8. The client polls `mctl-api` for workflow execution status and deployment sync/health

### Self-Healing Flow

1. AlertManager fires an alert (e.g., pod crash loop)
2. `mctl-agent` receives the alert webhook and creates a ticket
3. Evidence is collected and a skill is selected for diagnosis
4. The agent either prepares a direct fix PR or dispatches the incident to an external agent such as OpenClaw
5. A fix lands in `mctl-gitops` as a PR rather than mutating the cluster directly
6. On merge, ArgoCD syncs the change

## Data Flow

| Path | Protocol | Auth |
|------|----------|------|
| Client -> MCP Server | Streamable HTTP (POST/GET) | Bearer token per request |
| Client -> REST API | HTTPS | GitHub token / Dex JWT / OAuth JWT |
| Argo Workflows -> GitOps | Git (SSH) | Deploy key |
| ArgoCD -> Cluster | Kubernetes API | ServiceAccount |
| AlertManager -> Agent | Webhook (HTTP) | Internal network |
| Agent -> External agents | Signed webhook callbacks | Shared secret / callback auth |

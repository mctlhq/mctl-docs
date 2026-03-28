# GitOps Workflows

Every infrastructure change in MCTL flows through Git. ArgoCD watches the `mctl-gitops` repository and syncs the cluster to match the desired state.

## How GitOps Works in MCTL

```mermaid
sequenceDiagram
    autonumber
    participant User as Operator
    participant API as mctl-api
    participant WF as Argo Workflows
    participant Git as mctl-gitops
    participant Argo as ArgoCD
    participant K8s as Kubernetes

    Note over User,API: Request accepted quickly
    User->>API: Deploy service
    API->>WF: Submit async operation
    API-->>User: Return operation ID

    Note over WF,K8s: Cluster converges asynchronously via GitOps
    WF->>Git: Commit desired state
    Git->>Argo: Poll / refresh sees new commit
    Argo->>K8s: Apply manifests
    K8s-->>Argo: Resource state updated
    WF->>K8s: Execute workflow tasks
    Argo-->>API: Health / sync view
    WF-->>API: Workflow status view

    Note over User,API: Status remains queryable throughout
    User->>API: Check operation
    API-->>User: Current status
```

## Argo Workflows

Long-running operations (deploy, scale, rollback) are executed as Argo Workflows. You can:

### List Workflows

```
"Show me running workflows in staging"
```

### Check Workflow Status

```
"What's the status of workflow deploy-my-app-xyz?"
```

Workflow UI is available at [workflows.mctl.ai](https://workflows.mctl.ai).

## Repository Structure

The `mctl-gitops` repository is organized by tenant:

```
platform-gitops/
  services/
    admins/           # Platform services (mctl-api, mctl-web, etc.)
      mctl-api/
      mctl-web/
      mctl-docs/
    tenants/
      team-alpha/     # Tenant-scoped services
        my-app/
        my-api/
      team-beta/
        ...
```

## CI/CD Integration

When you push a tag to a service repository:

1. **CI builds** the Docker image and pushes to `ghcr.io/mctlhq/{repo}:{tag}`
2. **CI updates** `mctl-gitops` with the new image tag
3. **ArgoCD syncs** the change to the cluster

This pattern is used by all MCTL platform services and is available for tenant services.

## Grant Repository Access

To connect a GitHub repository to a tenant for automated deployments:

```
"Grant access to repo myorg/my-app for the staging tenant"
```

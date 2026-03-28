# Service Deployment

Services are containerized applications managed by MCTL. Every service operation flows through GitOps.

## Deploy a Service

### Via MCP

```
"Deploy my-app from ghcr.io/myorg/my-app:1.0.0 to the staging tenant"
```

The `mctl_deploy_service` tool:
1. Validates the image reference and tenant access
2. Commits the service manifest to `mctl-gitops`
3. Returns an operation ID for tracking
4. ArgoCD syncs the change to the cluster

### Track Deployment

```
"What's the status of operation op-abc123?"
"Show me recent operations in staging"
```

## Get Service Status

```
"Show me the status of my-app in staging"
"List all services in the production tenant"
```

The `mctl_get_service_status` tool returns:
- Current image and version
- Replica count and health
- Resource usage (CPU, memory)
- Recent events and conditions

## Get Service Config

```
"Show me the config for my-app in staging"
```

Returns the full service configuration including environment variables, resource limits, and deployment strategy.

## View Service Logs

```
"Show me logs for my-app in staging"
"Get the last 100 lines of logs for my-app"
```

## Scale a Service

```
"Scale my-app to 3 replicas in staging"
```

The `mctl_scale_service` tool updates the replica count through GitOps. The change is tracked as an operation.

## Rollback a Service

```
"Rollback my-app in staging to the previous version"
```

The `mctl_rollback_service` tool reverts to the previous image tag in the GitOps repo.

## Retire a Service

::: warning
Retiring a service removes it from the cluster. The GitOps history preserves the configuration for recovery.
:::

```
"Retire the old-api service from staging"
```

## Deployment Strategies

MCTL supports blue-green deployments by default. The platform handles:
- Creating the new version alongside the old
- Health checking the new version
- Switching traffic
- Cleaning up the old version

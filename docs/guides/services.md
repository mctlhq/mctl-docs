# Service Deployment

Services are containerized applications managed through GitOps. Deployment and
configuration writes require the developer role on the tenant (or platform admin).

## Deploy a Service

For a new service, use the repository-based [onboarding walkthrough](/guides/deploy-first-app).
The deployment tool accepts a repository and Git tag, not an arbitrary image URL:

```text
Onboard my-app from repo myorg/my-app tag 1.0.0 port 8080 for staging
```

`mctl_deploy_service(action="onboard", team_name="staging", component_name="my-app",
dockerfile_repo="myorg/my-app", git_tag="1.0.0", port="8080")` submits the build
and deployment workflow. For subsequent releases use `action="deploy"` with the
repository and new Git tag. Use `action="update-config"` to change environment
variables or secrets without rebuilding.

## Track Deployment

Keep the returned workflow name and poll `mctl_get_workflow_status`. The REST
submission response uses `workflowName`; pass it as `workflow_name` to the MCP
status tool. Then check `mctl_get_service_status` for ArgoCD sync/health and test
the service's configured host. Request acceptance is not deployment completion.

## Get Service Status

```text
Show me the status of my-app in staging
```

This returns ArgoCD sync/health and service configuration. For logs use
`mctl_get_service_logs`; for namespace quota usage use `mctl_get_resource_usage`.
These are separate calls, not fields guaranteed by service status.

## Get Service Config

`mctl_get_service_config(team="staging", service="my-app")` returns the service
configuration read from GitOps. Secret values are not exposed by this view.

## Scale a Service

`mctl_scale_service` configures HPA autoscaling, including its enabled flag,
minimum/maximum replicas and CPU threshold. See [Scaling](/guides/scaling).

## Rollback a Service

`mctl_rollback_service` requires an explicit `target_tag`. It updates `image.tag`
in GitOps without restoring old configuration, secrets or database state.
See [Rollbacks](/guides/rollbacks).

## Retire a Service

::: danger
Retirement requires the owner role. It removes service resources and can delete
Vault secrets and database resources. Git history is not a backup of those data.
:::

```text
Retire the old-api service from staging
```

## Deployment Strategies

The default chart uses a Kubernetes Deployment with rolling updates.
`blueGreen.enabled: true` in GitOps opts into an Argo Rollout. Review the chart's
promotion policy before relying on automatic traffic switching.

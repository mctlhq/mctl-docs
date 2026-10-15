# Scaling

`mctl_scale_service` changes HPA autoscaling through the deploy-service
`update-config` workflow. It requires the developer role on the tenant.

## Configure autoscaling

```text
mctl_scale_service(
  team_name="staging",
  component_name="my-app",
  autoscaling_enabled="true",
  min_replicas="2",
  max_replicas="5",
  cpu_threshold="80"
)
```

Parameters are strings. The required `autoscaling_enabled` value is `"true"` or
`"false"`. Optional defaults are 1 minimum replica, 5 maximum replicas and an
80% CPU threshold. Keep the returned workflow name and check workflow and service
status. The HPA needs resource requests and metrics to make scaling decisions.

This tool has no direct `replicas` parameter. Disabling HPA does not itself select
a new fixed replica count; fixed replicas are configured in the service Helm values.

## Check Resource Usage

```text
Show me resource usage for staging
```

`mctl_get_resource_usage(team="staging")` reports namespace resource quota usage
against allocation. It is not per-pod CPU/memory telemetry. Check application
metrics separately before choosing autoscaling thresholds.

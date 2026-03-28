# Scaling

Scale your services up or down based on demand.

## Scale Replicas

```
"Scale my-app to 5 replicas in the production tenant"
```

The `mctl_scale_service` tool updates the replica count through GitOps. Changes are tracked as operations.

## Resource Profiles

Use OpenClaw resource profiles to right-size your services:

### Get Sizing Recommendations

```
"Get resource sizing recommendations for my-app in staging"
```

The `mctl_get_openclaw_sizing_recommendation` tool analyzes current resource usage and suggests optimal CPU and memory limits.

### Apply a Resource Profile

```
"Apply the recommended resource profile to my-app in staging"
```

## Check Resource Usage

```
"Show me resource usage for my-app in staging"
```

The `mctl_get_resource_usage` tool returns current CPU and memory utilization compared to requests and limits.

<!-- TODO: Document HPA configuration and auto-scaling policies -->

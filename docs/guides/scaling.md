# Scaling

Scale your services up or down based on demand.

## Scale Replicas

```
"Scale my-app to 5 replicas in the production tenant"
```

The `mctl_scale_service` tool updates the replica count through GitOps. Changes are tracked as operations.

## Check Resource Usage

```
"Show me resource usage for my-app in staging"
```

The `mctl_get_resource_usage` tool returns current CPU and memory utilization compared to requests and limits.

<!-- TODO: Document HPA configuration and auto-scaling policies -->

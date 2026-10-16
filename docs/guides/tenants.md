# Tenant Management

Tenants are the primary isolation boundary in MCTL. Each tenant gets its own Kubernetes namespace, RBAC policies, and resource quotas.

## Create a Tenant

### Via MCP (Natural Language)

```
"Create a new tenant called backend-team"
```

This calls the `mctl_create_tenant` tool, which submits a workflow that:
1. Creates a namespace in the cluster
2. Sets up RBAC roles and bindings
3. Configures resource quotas and limit ranges
4. Registers the tenant in the service catalog

### Via Self-Service Form

Visit [mctl.ai](https://mctl.ai/#request-access) and submit a workspace request after GitHub sign-in. Confirm provisioning and MCTL sign-in with your operator before using it; the request session does not itself grant platform UI access.

## List Tenants

### Via MCP

```
"Who am I on MCTL?"
"Show me details of my-team"
```

`mctl_whoami` reports your accessible namespaces; `mctl_get_tenant` reads a
specific tenant. Listing all tenants with `mctl_list_tenants` requires platform
admin access.

### Via API (platform admins only)

```bash
curl -H "Authorization: Bearer $TOKEN" https://api.mctl.ai/api/v1/tenants
```

## Get Tenant Details

```
"Show me details of the staging tenant"
"What services are running in production?"
```

This returns tenant configuration and services. Use the resource, domain and operations tools separately for those views.

## Delete a Tenant

::: danger
Deleting a tenant removes the namespace and all its resources. This action cannot be undone.
:::

```
"Delete the test-env tenant"
```

The `mctl_delete_tenant` tool requires the tenant owner role (or platform admin) and submits a workflow to:
1. Remove all services in the tenant
2. Delete the namespace and all resources
3. Clean up RBAC bindings and catalog entries

## Tenant Naming

Tenant namespaces use the team name directly (no prefix). For example, a tenant named `backend-team` creates a namespace called `backend-team`.

## Resource Quotas

Defaults depend on the provisioning entry point. The operations API currently supplies the following defaults; existing tenant values and portal requests may override them. Inspect the actual workspace quota before sizing a workload:

| Resource | Default |
|----------|---------|
| CPU requests | 500m |
| CPU limits | 3 cores |
| Memory requests | 1280Mi |
| Memory limits | 4Gi |
| Pods | 10 |

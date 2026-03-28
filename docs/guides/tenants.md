# Tenant Management

Tenants are the primary isolation boundary in MCTL. Each tenant gets its own Kubernetes namespace, RBAC policies, and resource quotas.

## Create a Tenant

### Via MCP (Natural Language)

```
"Create a new tenant called backend-team"
```

This calls the `mctl_create_tenant` tool, which:
1. Creates a namespace in the cluster
2. Sets up RBAC roles and bindings
3. Configures resource quotas and limit ranges
4. Registers the tenant in the service catalog

### Via Self-Service Form

Visit [mctl.ai](https://mctl.ai) and use the tenant creation form. You'll need to authenticate with GitHub first.

## List Tenants

### Via MCP

```
"Show me all tenants"
"List tenants I have access to"
```

### Via API

```bash
curl -H "Authorization: Bearer $TOKEN" https://api.mctl.ai/api/tenants
```

## Get Tenant Details

```
"Show me details of the staging tenant"
"What services are running in production?"
```

This returns the tenant's services, resource usage, domains, and recent operations.

## Delete a Tenant

::: danger
Deleting a tenant removes the namespace and all its resources. This action cannot be undone.
:::

```
"Delete the test-env tenant"
```

The `mctl_delete_tenant` tool will:
1. Remove all services in the tenant
2. Delete the namespace and all resources
3. Clean up RBAC bindings and catalog entries

## Tenant Naming

Tenant namespaces use the team name directly (no prefix). For example, a tenant named `backend-team` creates a namespace called `backend-team`.

## Resource Quotas

Each tenant has default resource quotas that can be adjusted:

| Resource | Default |
|----------|---------|
| CPU requests | 2 cores |
| CPU limits | 4 cores |
| Memory requests | 4Gi |
| Memory limits | 8Gi |
| Pods | 20 |
| Services | 10 |

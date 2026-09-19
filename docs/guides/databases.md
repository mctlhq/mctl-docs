# Database Provisioning

MCTL can provision databases for your services within a tenant.

## Provision a Database

```
"Provision a PostgreSQL database for my-app in the staging tenant"
```

The `mctl_provision_database` tool:
1. Creates a database and role on the shared CNPG PostgreSQL cluster
2. Stores credentials in Vault and syncs them to a Secret in the tenant namespace
3. Wires the Secret into the service configuration through GitOps

The tool returns a workflow name. Track it with `mctl_get_workflow_status`,
then verify that the service can connect after ArgoCD and External Secrets sync.

## Configuration

Database credentials are automatically injected into your service as environment variables:

| Variable | Description |
|----------|-------------|
| `DB_HOST` | Database hostname |
| `DB_PORT` | Database port |
| `DB_NAME` | Database name |
| `DB_USER` | Database username |
| `DB_PASSWORD` | Database password |
| `DATABASE_URL` | Full connection string |

## Supported Databases

The provisioning operation supports PostgreSQL on the platform's shared CNPG cluster.

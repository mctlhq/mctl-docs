# Database Provisioning

MCTL can provision databases for your services within a tenant.

## Provision a Database

```
"Provision a PostgreSQL database for my-app in the staging tenant"
```

The `mctl_provision_database` tool:
1. Creates a database instance in the tenant namespace
2. Generates credentials and stores them as Kubernetes secrets
3. Returns connection details for your application

## Configuration

Database credentials are automatically injected into your service as environment variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_HOST` | Database hostname |
| `DATABASE_PORT` | Database port |
| `DATABASE_NAME` | Database name |
| `DATABASE_USER` | Database username |
| `DATABASE_PASSWORD` | Database password |
| `DATABASE_URL` | Full connection string |

## Supported Databases

<!-- TODO: Document supported database types and versions -->

Currently supported database engines will be listed here as they become available.

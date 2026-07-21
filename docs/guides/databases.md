# Database Provisioning

MCTL can provision databases for your services within a tenant.

## Provision a Database

```
"Provision a PostgreSQL database for my-app in the staging tenant"
```

The `mctl_provision_database` tool:
1. Creates a database and role on the platform's shared PostgreSQL cluster
2. Stores the generated credentials in Vault; an ExternalSecret syncs them
   into a Kubernetes Secret in your tenant namespace
3. Returns connection details for your application

## Configuration

Database credentials are automatically injected into your service as environment variables:

| Variable | Description |
|----------|-------------|
| `DB_HOST` | Database hostname |
| `DB_PORT` | Database port |
| `DB_NAME` | Database name |
| `DB_USER` | Database username |
| `DB_PASSWORD` | Database password |
| `DATABASE_URL` | Full connection string (`postgresql://...`) |

Connect on port `5432` — connections go through PgBouncer, not the CNPG
internal port.

## Supported Databases

PostgreSQL (17.x), provided by the shared [CloudNativePG](https://cloudnative-pg.io/)
cluster. Other engines are not currently offered.

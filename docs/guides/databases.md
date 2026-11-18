---
title: PostgreSQL Database Provisioning via MCP & GitOps
description: Provision CNPG PostgreSQL databases with automated HashiCorp Vault secrets and Kubernetes Secret injection via MCTL natural language commands.
---

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

## Supported Databases

The provisioning operation supports PostgreSQL on the platform's shared CNPG cluster.

The generated database secret exposes the `DB_*` variables above. If your app
requires `DATABASE_URL`, configure it explicitly; it is not guaranteed by the
provisioning template.

## Schema migrations and parallel PRs

mctl provisions the database and its credentials. It does not run, order or check your schema migrations. Your
application, or your own tooling, owns them. This section is guidance only; it describes failure modes and an
optional check you can add yourself.

### Why a clean Git merge is not a clean apply

Two pull requests that branch from the same schema state are each tested alone. Git can merge them without a
conflict and the result can still fail or surprise you:

- Two migrations use the same version identifier, or run in a different order in different environments.
- Both changes assume the pre-merge schema, for example both add a `NOT NULL` column to one table, or one
  renames a column the other indexes.
- The merge applies without error but produces a schema that neither author tested.

Use collision-resistant version identifiers and run migrations from one place. An advisory lock serializes
concurrent runs, but it does not detect logical conflicts.

### Old and new application versions overlap

During a rollout the old and new application versions run at the same time, so the schema must serve both.
Use expand/contract: add compatible structure first, switch the application, and remove the old structure in a
later change.

### Two different verifications

- Applying the whole migration set to an empty database shows that it applies from scratch.
- Upgrading the supported previous schema, populated with synthetic data, shows the real upgrade path.

The first does not prove the second.

### Recovery

Rolling back the application image does not roll back the database. Plan either a coordinated forward fix or a
schema and data rollback that you verified separately in advance. Backup and restore support is not assumed
here.

### Optional merge-result check

This is a recommendation, not a platform feature. mctl, `deploy-service` and DevLoop do not run or enforce it.
If you want it, add it to your own CI as an opt-in job on pull requests. It evaluates the merge result of the
pull request and its target branch rather than the branch alone: apply the migrations to an empty database and,
separately, to the previous supported schema with synthetic data.

Limits to keep in mind:

- The merge result goes stale when the target branch moves. Require up-to-date branches or use a merge queue.
- It needs a deterministic ordering rule for migrations.
- Independent changes to different objects can merge legitimately, so a failure is not always a conflict.
- A schema diff is not an oracle. Reviewers need to know the expected semantics, and any committed schema
  snapshot needs a reviewed refresh procedure. A snapshot refreshed to match a failing result proves nothing.

This idea has not been measured or deployed. Conflict-class coverage, latency, CI cost, false-positive rate and
the migration tool each service uses are all unmeasured, and no coverage or saving is claimed.

# Rollbacks

Quickly revert a service to its previous version when something goes wrong.

## Rollback a Service

```
"Rollback my-app in production to image tag 1.2.3"
```

The `mctl_rollback_service` tool:
1. Uses the explicit `target_tag` you supply; it does not discover the previous tag
2. Commits the rollback to `mctl-gitops`
3. ArgoCD syncs the change
4. Returns a workflow name for tracking

## How Rollbacks Work

A rollback updates `image.tag` in the service values and creates a new Git commit.
Choose a known-good image tag from your release history. This does not restore
previous environment variables, secrets, other configuration, or database state;
configuration and schema recovery need separate changes. This provides:

- Full audit trail of what changed and when
- The rollback itself is a new commit (not a force-push)
- ArgoCD handles the actual Kubernetes rollout
- Most services roll back via a standard rolling update; blue-green is an
  opt-in strategy for services that need it, not the default

## Check Rollback Status

```
"What is the status of workflow rollback-service-abc12?"
```

## When to Rollback

Common scenarios:
- Application crashes after a new deployment
- Performance degradation detected
- A faulty image release (configuration-only failures require a configuration fix)
- The mctl-agent may also trigger automatic rollbacks based on alerts

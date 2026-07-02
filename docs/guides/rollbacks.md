# Rollbacks

Quickly revert a service to its previous version when something goes wrong.

## Rollback a Service

```
"Rollback my-app in production to the previous version"
```

The `mctl_rollback_service` tool:
1. Identifies the previous image tag from GitOps history
2. Commits the rollback to `mctl-gitops`
3. ArgoCD syncs the change
4. Returns an operation ID for tracking

## How Rollbacks Work

Since every deployment is a Git commit, rollbacks are simply reverting to the previous commit's state. This means:

- Full audit trail of what changed and when
- The rollback itself is a new commit (not a force-push)
- ArgoCD handles the actual Kubernetes rollout
- Most services roll back via a standard rolling update; blue-green is an
  opt-in strategy for services that need it, not the default

## Check Rollback Status

```
"What's the status of operation op-rollback-xyz?"
```

## When to Rollback

Common scenarios:
- Application crashes after a new deployment
- Performance degradation detected
- Configuration error causing failures
- The mctl-agent may also trigger automatic rollbacks based on alerts

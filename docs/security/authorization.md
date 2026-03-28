# Authorization

MCTL enforces tenant-scoped access control. Users can only access resources in tenants they belong to.

## RBAC Model

Access is determined by group membership:
- Each tenant has associated groups in the GitOps configuration
- Users are mapped to groups via their GitHub organization membership or SSO claims
- API requests are checked against the user's groups before accessing tenant resources

## Tenant Isolation

Tenants are fully isolated:
- Each tenant has its own Kubernetes namespace
- Network policies restrict cross-namespace traffic
- Resource quotas prevent noisy-neighbor issues
- RBAC roles are scoped to the tenant namespace

## Permission Levels

| Action | Required Access |
|--------|----------------|
| List tenants | Authenticated user |
| Read tenant resources | Tenant member |
| Deploy / scale / rollback | Tenant member |
| Create / delete tenant | Organization admin |
| Platform operations | Platform admin |

## How Groups Work

Groups are defined in `mctl-gitops` and map GitHub teams or Dex groups to tenants:
- A user in the `backend-team` GitHub team gets access to the `backend-team` tenant
- Platform admins have access to all tenants
- Group membership is resolved at request time (no caching)

<!-- TODO: Document group configuration format and examples -->

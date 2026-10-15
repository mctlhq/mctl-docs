# Authorization

Authentication establishes who called the API. Tenant membership and operation
roles determine what that caller may do. Signing in does not grant tenant access.

## Tenant roles

Tenant membership is stored in GitOps tenant/team `members` lists. The API
supports login-keyed and principal-keyed membership modes; the configured mode
selects the authority. GitHub organization membership or arbitrary identity-provider
claims alone are not a general grant to a workspace. Use `mctl_whoami` to inspect
your effective namespaces and ask the operator to check your membership.

| Action | Minimum access |
|---|---|
| Inspect own identity | Authenticated user |
| List all tenants | Platform admin |
| Read an accessible tenant's resources | Tenant access; viewer is read-only |
| Deploy, update configuration, autoscale, rollback, provision a database | Developer |
| Create or delete a preview; add or verify a custom domain | Developer |
| Retire a service, delete a tenant, remove a custom domain | Owner |
| Create a tenant through the operations API | Authenticated caller, subject to creation policy |
| Run platform agent pipelines and platform administration | Platform admin |

Owners satisfy developer requirements. Platform admins pass tenant role gates.
Unknown roles are refused. If the role cannot be read, the API reports an error
rather than treating the caller as authorized. Some tools are hidden from MCP
`tools/list` based on permissions; visibility does not replace authorization on calls.

## Identity modes

In legacy/shadow authorization mode, membership checks use the verified GitHub
login; shadow mode evaluates principal membership for comparison without switching
the enforcing decision. Principal mode uses the canonical principal ID instead.
Do not infer the active mode from a display name or the sign-in provider.

CI jobs and service credentials have their own restricted policies. For example,
GitHub Actions OIDC permits deployment only to the component bound to that
repository; it does not grant an interactive tenant role.

## Isolation and platform tools

Namespaces, RBAC, network policies and quotas restrict tenant workloads on a
shared cluster. They do not provide dedicated hardware or eliminate all shared
infrastructure risks. Outbound internet access is an explicit tenant setting.

Portal, ArgoCD, Argo Workflows, Vault and kubectl have separate sign-in and access
configuration. A successful API call does not prove access to those interfaces.
See [Authentication](/security/authentication) and the
[first-user checklist](/guides/first-user-checklist).

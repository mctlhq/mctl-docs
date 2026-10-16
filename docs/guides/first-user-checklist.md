# First-user checklist

- [ ] Confirm that provisioning has completed and that your operator has enabled
  your MCTL account. A website request or welcome email alone is not proof of readiness.
- [ ] Sign in at [app.mctl.ai](https://app.mctl.ai) if portal access is granted.
  Resolve login or missing-workspace problems with the operator before proceeding.
- [ ] [Connect an MCP client](/mcp/connecting), run `mctl_whoami`, and inspect your
  workspace with `mctl_get_tenant`. Deployment needs developer access; see [roles](/security/authorization).
- [ ] Prepare a GitHub repository, Dockerfile, health endpoints and release tag.
  Grant repository access and sync it using the [first-app guide](/guides/deploy-first-app).
  Auto-deployment on push requires the optional [CI job](/guides/scaffolding).
- [ ] Onboard the service, keep the returned workflow name and check its status.
  Then confirm service Synced/Healthy, inspect logs and test the application URL.
- [ ] Configure preview secrets separately before using [previews](/guides/previews).

## Optional operator interfaces

ArgoCD, Argo Workflows, Vault and kubectl access are separate grants, not
prerequisites for the MCP workflow and not automatic consequences of creating a
tenant. Use [ops.mctl.ai](https://ops.mctl.ai) and
[workflows.mctl.ai](https://workflows.mctl.ai) only when your operator has enabled
the corresponding access. Otherwise inspect status and logs through MCP.

# First-user checklist

Use this checklist immediately after your MCTL tenant is provisioned. It covers every
access and setup step required before you run your first workload. Each item links to
the relevant deep-dive guide or URL for more detail.

---

- [ ] **1. Confirm your tenant**
  Your tenant is the Kubernetes namespace that owns your services, resource quotas, and
  access controls. Sign in at [app.mctl.ai](https://app.mctl.ai) and verify that your
  tenant appears on the dashboard. If you need to create one, follow the
  [Tenants guide](/guides/tenants).

- [ ] **2. Verify Portal access**
  Open [app.mctl.ai](https://app.mctl.ai) in a browser and confirm that you can sign in
  and see your tenant's dashboard. If you encounter a login error or missing tenant,
  contact your platform operator before proceeding.

- [ ] **3. Verify ArgoCD access**
  Open [argocd.mctl.ai](https://argocd.mctl.ai) and confirm that you can sign in and
  see your tenant's applications. ArgoCD is the GitOps engine that manages continuous
  deployment for your services.

- [ ] **4. Verify Argo Workflows access**
  Open [workflows.mctl.ai](https://workflows.mctl.ai) and confirm that you can sign in
  and view the workflow namespace for your tenant. Argo Workflows runs the build and
  deployment pipelines triggered by each push to your repository.

- [ ] **5. Prepare a Git repository or Docker image**
  Your workload must be reachable from MCTL. For source-based deployments, push your
  application code to a GitHub repository and ensure you have a Dockerfile (or use
  MCTL scaffolding to generate one). See
  [Deploy your first app - Step 2](/guides/deploy-first-app#step-2-prepare-a-repository)
  and the [Scaffolding guide](/guides/scaffolding) for details.

- [ ] **6. Deploy your first workload**
  Follow the [Deploy your first app](/guides/deploy-first-app) guide to connect your
  repository to MCTL, run the onboarding workflow, and obtain a live service URL. This
  step covers both the portal path and the MCP path.

- [ ] **7. Review logs and deployment status**
  After deployment completes, confirm the service is healthy by checking the workflow
  run in [Argo Workflows](https://workflows.mctl.ai) and reviewing application logs.
  You can also inspect status and retrieve logs through the
  [MCP Tools Reference](/mcp/tools-reference) if you have an AI client connected.

- [ ] **8. Manage your platform via MCP**
  MCTL exposes its full management surface through a Model Context Protocol server,
  allowing you to deploy, scale, and inspect services from any MCP-compatible AI
  client. Start with the [MCP Overview](/mcp/overview), then follow the
  [Connecting guide](/mcp/connecting) to wire up your client.

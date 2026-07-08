# Deploy your first app

This guide walks you through taking a GitHub-hosted application from source code to a
running, publicly accessible service on MCTL. It covers both the portal-based path and
the MCP-based path for each step.

By the end you will have a live service URL in the form
`https://<team>-<service>.mctl.ai` with a passing health check.

## Before you begin

- A GitHub account with push access to your application repository.
- An MCTL tenant. If you do not have one yet, create one at
  [mctl.ai](https://mctl.ai) or follow the instructions in the
  [Quick Start](/getting-started/) guide.
- An AI client connected to MCTL via MCP if you intend to use the MCP path.
  See [Connecting](/mcp/connecting) for setup instructions.

---

## Step 1: Choose or confirm your tenant

Every service belongs to a tenant (a Kubernetes namespace with its own
resource quotas and access controls). Confirm which tenant you will deploy
to before proceeding.

### Via the portal

Sign in at [app.mctl.ai](https://app.mctl.ai). Your tenants are listed on
the dashboard. Note the team name — you will use it throughout this guide.

### Via MCP

```
List my tenants
```

The `mctl_list_tenants` tool returns all tenants you have access to.
If you need to create one:

```
Create a new tenant called my-team
```

This calls `mctl_create_tenant` and provisions a namespace, RBAC policies,
and resource quotas. See [Tenant Management](/guides/tenants) for details.

---

## Step 2: Prepare a repository

Your application must live in a GitHub repository that MCTL can access.
Before continuing:

- The repository exists under a GitHub user or organisation account.
- The default branch (`main`) contains the application source code.
- No credentials or secrets are committed to the repository.

If you do not have a repository yet, create one on GitHub, push your source
code, and return to this guide.

---

## Step 3: Add a Dockerfile

MCTL builds your container image from a `Dockerfile` at the repository root.
A minimal Node.js example is shown below. For other runtimes (Python, Go,
static SPA) see [Scaffolding](/guides/scaffolding).

```dockerfile
FROM node:22.11-alpine3.20

RUN apk add --no-cache tini

ENV NODE_ENV=production \
    PORT=8787

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

RUN addgroup -S app && adduser -S -G app app && chown -R app:app /app

USER app

EXPOSE 8787

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:8787/healthz', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]
```

Add a `GET /healthz` endpoint to your application that returns `200 {"ok": true}`.
MCTL uses this endpoint for liveness checks.

Commit the Dockerfile to the default branch before proceeding.

---

## Step 4: Grant MCTL access to the repository

MCTL needs read access to your repository to build the container image. If
your repository is already accessible (for example, you previously granted
access for another service in the same organisation), you can skip this step
and proceed directly to Step 5.

### Via MCP

Ask your AI assistant:

```
Grant access to repo <owner>/<repo> for my-team
```

This calls `mctl_grant_repo_access(team_name="my-team", repo="<owner>/<repo>")`.
The tool returns a GitHub App installation URL. Open that URL in your
browser and install the MCTL GitHub App on the repository or organisation.

::: tip
The portal path for granting repository access is not yet documented.
Use the MCP path above, then return to the portal for subsequent steps if
you prefer the graphical interface. A follow-up will add portal
instructions once the exact UI path is confirmed.
:::

---

## Step 5: Sync repositories

After installing the GitHub App, sync the repository list so MCTL registers
the newly accessible repository.

### Via MCP

```
Sync repos for my-team
```

This calls `mctl_sync_repos(team="my-team")`.

::: tip
Repository sync via the portal is not yet documented. Use the MCP path
above. A follow-up will add portal instructions once the exact UI path is
confirmed.
:::

---

## Step 6: Onboard the service

The onboard step creates the GitOps manifests and submits the first Argo
Workflow to build and deploy your container image.

### Via MCP

Ask your AI assistant:

```
Onboard service my-service from repo <owner>/<repo> tag 0.1.0 port 8787 for my-team
```

This calls:

```
mctl_deploy_service(
  action="onboard",
  team_name="my-team",
  component_name="my-service",
  dockerfile_repo="<owner>/<repo>",
  git_tag="0.1.0",
  port="8787",
  service_template="default"
)
```

Parameters:

| Parameter | Description |
|-----------|-------------|
| `action` | Always `"onboard"` for a first-time deploy |
| `team_name` | Your tenant name from Step 1 |
| `component_name` | The service name — used in the generated URL |
| `dockerfile_repo` | GitHub repository in `<owner>/<repo>` format |
| `git_tag` | The Git tag to build. Tag your repository before onboarding (`git tag 0.1.0 && git push --tags`) |
| `port` | The container port your application listens on (matches the `EXPOSE` in your Dockerfile) |
| `service_template` | Use `"default"` unless you have a specific template |

The tool returns an operation ID. MCTL submits an Argo Workflow in the
background — proceed to Step 7 to track it.

For a complete CI setup that auto-deploys on every push to `main`, see
[Scaffolding](/guides/scaffolding).

---

## Step 7: Track the workflow status

The onboard operation runs as an Argo Workflow. Check its status to confirm
the deployment succeeded before accessing the service URL.

### Via MCP

```
What is the status of the deploy workflow for my-service?
```

This calls `mctl_get_workflow_status` with the workflow name returned in
Step 6. A `Succeeded` status means the service is running.

You can also browse all workflows for your team at
[workflows.mctl.ai](https://workflows.mctl.ai).

::: tip
If the workflow fails, check the logs at [workflows.mctl.ai](https://workflows.mctl.ai)
or ask your AI assistant for the workflow logs. Common causes are a missing
`/healthz` endpoint or a Dockerfile that fails to build.
:::

---

## Step 8: Open the generated service URL

Every service receives an auto-generated URL in the form:

```
https://<team>-<service>.mctl.ai
```

For example, if your team is `my-team` and your service is `my-service`,
the URL is `https://my-team-my-service.mctl.ai`.

Verify the service is responding:

```bash
curl https://my-team-my-service.mctl.ai/healthz
```

You should receive `200 {"ok": true}`. If the health check fails and the
workflow reported `Succeeded`, wait 30 seconds for DNS propagation and
retry.

---

## Optional: Add a custom domain

To serve your application on your own domain (for example, `api.example.com`):

### Via MCP

```
Add domain api.example.com to my-service in my-team
```

This calls `mctl_add_custom_domain`. MCTL returns the CNAME target to
configure in your DNS provider. TLS is provisioned automatically once the
CNAME record propagates.

See [Custom Domains](/guides/domains) for verification steps and
troubleshooting.

---

## Optional: Manage the platform through MCP

Once your service is running you can manage it entirely through your AI
client. Common next steps:

- **Deploy a new version** — push a new Git tag and ask your assistant to
  deploy it, or set up the CI auto-deploy job from [Scaffolding](/guides/scaffolding).
- **Scale** — ask your assistant to scale `my-service` to a different
  replica count.
- **Roll back** — ask your assistant to roll back `my-service` to a
  previous tag.
- **View logs** — ask your assistant to show recent logs for `my-service`.

The full list of available tools is in the [MCP Tools Reference](/mcp/tools-reference).
For a curated set of example prompts, see [MCP Examples](/mcp/examples).

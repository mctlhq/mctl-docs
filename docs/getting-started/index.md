# Getting Started

This guide takes you from zero to a running service on MCTL in under 10 minutes. No Kubernetes experience required.

## Prerequisites

- A GitHub account
- An AI client that supports MCP (Claude.ai, Claude Code, Cursor, or VS Code)

## Step 1: Sign in and create a tenant

Visit [mctl.ai](https://mctl.ai) and click **Sign in with GitHub**. After authenticating, you'll see the tenant creation form.

Enter your team name and description, then submit. MCTL will automatically provision:

- A Kubernetes namespace for your team
- RBAC policies and network isolation
- Resource quotas (2 CPU, 4Gi memory, 20 pods by default)
- Vault secrets scope
- SSO access via your GitHub identity

You'll receive a welcome email with your tenant details.

::: tip
Tenant names become Kubernetes namespace names. Use lowercase letters, numbers, and hyphens only (e.g. `backend-team`, `data-squad`).
:::

## Step 2: Connect your AI client

### Claude.ai (recommended)

The fastest way to connect:

1. Visit [mctl.ai/mcp](https://mctl.ai/mcp)
2. Click **Connect with Claude.ai**
3. Authorize the OAuth connection
4. Start a new conversation in Claude.ai

### Claude Code

```bash
claude mcp add mctl --transport streamable-http https://api.mctl.ai/mcp \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Get your token at [mctl.ai/mcp](https://mctl.ai/mcp) after signing in.

### Cursor / VS Code

See [Connecting](/mcp/connecting) for configuration snippets for all supported AI clients.

## Step 3: Verify your connection

Ask your AI assistant:

```
Who am I on MCTL?
```

You should see your GitHub username, organization, and the tenant you just created.

```
What tenants do I have access to?
```

This confirms your tenant is provisioned and accessible.

## Step 4: Deploy your first service

Tell your AI assistant to deploy a service. You need a container image — if you don't have one, you can use a public image:

```
Deploy hello-world from ghcr.io/mctlhq/hello-world:latest to my-team
```

Replace `my-team` with your actual tenant name.

MCTL will:
1. Validate your access to the tenant
2. Create service manifests in the GitOps repository
3. Submit an Argo Workflow to build and deploy
4. Return an operation ID

### Track the deployment

```
What's the status of that deployment?
```

Or use the operation ID directly:

```
Show me the status of workflow deploy-service-abc12
```

### Verify the service is running

```
Show me the status of hello-world in my-team
```

You should see:
- **Sync status**: Synced
- **Health**: Healthy
- **Host**: `hello-world.mctl.ai` (or your custom domain)

### Check the logs

```
Show me logs for hello-world in my-team
```

## Step 5: Explore more capabilities

Now that your first service is running, try these:

### Scale your service

```
Scale hello-world to 3 replicas in my-team
```

### Check resource usage

```
What's the resource usage for my-team?
```

### Add a custom domain

```
Add domain api.example.com to hello-world in my-team
```

### Create a preview environment

```
Create a preview of hello-world with tag pr-42 in my-team
```

### View incidents

```
Are there any open incidents?
```

## What's next?

| Topic | Description |
|-------|-------------|
| [Platform Overview](/platform/overview) | How MCTL works under the hood |
| [Architecture](/platform/architecture) | Component diagram and data flow |
| [Service Deployment](/guides/services) | Advanced deployment options |
| [Custom Domains](/guides/domains) | Configure DNS and TLS |
| [Databases](/guides/databases) | Provision PostgreSQL databases |
| [MCP Tools Reference](/mcp/tools-reference) | All 39 available tools |
| [REST API](/api/) | Direct API access for scripts and CI/CD |
| [Troubleshooting](/reference/troubleshooting) | Common issues and solutions |

## Architecture at a glance

```
You (AI / API / Portal)
  |
  v
mctl-api  ------>  Argo Workflows  ------>  mctl-gitops
                                                |
                                                v
                                             ArgoCD
                                                |
                                                v
                                           Kubernetes
```

Every change flows through Git. ArgoCD ensures the cluster matches the desired state. See [GitOps Workflows](/guides/gitops-workflows) for details.

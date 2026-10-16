# Getting Started

Start with an accessible workspace, connect an MCP client, then onboard your
application from a GitHub repository. Provisioning and sign-in access are separate
steps; submitting a request does not mean a workspace is ready.

## Prerequisites

- A GitHub account and a repository containing your application and Dockerfile
- An MCTL sign-in account with access to a provisioned workspace
- An MCP client with Streamable HTTP and OAuth support

## Step 1: Request a workspace and confirm access

Visit [mctl.ai](https://mctl.ai/#request-access), sign in with GitHub for the
request form, and submit your team details. Wait for provisioning and confirm
platform sign-in with your operator. The website's GitHub session does not by
itself establish an account at [auth.mctl.ai](https://auth.mctl.ai) or grant
access to the portal, ArgoCD, Argo Workflows, Vault or kubectl.

A tenant provides a namespace, resource quotas, network policies and a Vault
scope for workloads. Human access to individual platform tools is granted
separately. See the [first-user checklist](/guides/first-user-checklist).

## Step 2: Connect your AI client

Use `https://api.mctl.ai/mcp` in your client's MCP server settings and complete
MCTL sign-in in the browser. Do not paste a personal token into the config.

For Claude Code:

```bash
claude mcp add mctl --transport http https://api.mctl.ai/mcp
```

Complete the client's OAuth sign-in when prompted. See [Connecting](/mcp/connecting)
for the supported client configurations.

## Step 3: Verify your connection

Ask your assistant:

```text
Who am I on MCTL?
Show me details of my-team
```

`mctl_whoami` reports your identity and accessible namespaces. Replace `my-team`
with one of those namespaces; `mctl_get_tenant` checks access to that workspace.
Listing every tenant requires platform admin access. Writes also require the
appropriate [tenant role](/security/authorization).

## Step 4: Onboard your first service

Follow [Deploy your first app](/guides/deploy-first-app) to grant repository access,
sync repositories and prepare a Git tag and Dockerfile. Then ask:

```text
Onboard hello-world from repo myorg/hello-world tag 1.0.0 port 8080 for my-team
```

Use your own repository and tag. `mctl_deploy_service` submits an Argo Workflow;
it is not an arbitrary container-image import tool. Keep the returned workflow
name, poll `mctl_get_workflow_status`, then inspect `mctl_get_service_status`.
Confirm ArgoCD is Synced and Healthy and test the returned service host.
A submitted request or a completed build alone does not prove the service is ready.

## Next steps

- [Service deployment](/guides/services), [scaffolding and CI](/guides/scaffolding)
- [Autoscaling](/guides/scaling), [rollbacks](/guides/rollbacks), [previews](/guides/previews)
- [Custom domains](/guides/domains), [databases](/guides/databases)
- [MCP tools](/mcp/tools-reference), [REST API](/api/)
- [Architecture](/platform/architecture), [troubleshooting](/reference/troubleshooting)

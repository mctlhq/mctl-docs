# Troubleshooting

Common issues and how to resolve them.

## Authentication

### "Unauthorized" error

Your token may be expired or invalid.

1. Sign in again at [mctl.ai/mcp](https://mctl.ai/mcp)
2. Verify your GitHub account has organization membership
3. Check the `Authorization: Bearer` header format

For OAuth tokens (Claude.ai connector): disconnect and reconnect the MCP server.

### "Forbidden" on tenant operations

Your GitHub identity does not have access to the requested tenant.

- Check your GitHub team membership — tenants are mapped to GitHub teams
- Destructive operations (`delete_tenant`, `retire_service`) require admin group membership
- Ask your tenant admin to verify your access

### Token type confusion

MCTL accepts three token types. The API auto-detects the type:

| Token looks like | Type | How to get |
|------------------|------|------------|
| No dots (e.g. `ghp_abc123`) | GitHub PAT | GitHub Settings > Tokens |
| 2 dots, external issuer | Dex JWT | SSO login at `ops.mctl.ai` |
| 2 dots, self-issued | OAuth JWT | OAuth flow at `mctl.ai/mcp` |

If your token is rejected, ensure you're using the right type for your client.

## MCP Connection

### Tools not appearing in Claude.ai

1. Disconnect the MCP server from Claude.ai settings
2. Clear your browser cache
3. Reconnect via [mctl.ai/mcp](https://mctl.ai/mcp)
4. Start a **new** conversation (existing conversations don't pick up tool changes)

### Timeout errors on tool calls

Operations like `deploy-service` and `scale-service` are async. The tool returns an operation ID immediately — the actual work happens in the background.

If the MCP endpoint itself times out:
- Check if `api.mctl.ai` is reachable
- The request timeout is 30 seconds; complex queries may need a simpler filter
- Try again — transient network issues resolve quickly

### "Connection refused" in Claude Code / Cursor

Verify the MCP server URL is exactly `https://api.mctl.ai/mcp` (not `/api/v1/mcp` or other paths).

Check that you haven't set `type: "stdio"` — MCTL uses `streamable-http` transport:

```json
{
  "mcpServers": {
    "mctl": {
      "type": "streamable-http",
      "url": "https://api.mctl.ai/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_TOKEN"
      }
    }
  }
}
```

## Deployment

### Deployment stuck in "Pending" or "Progressing"

1. Check the operation status:
   ```
   "What's the status of workflow deploy-service-xyz?"
   ```
2. Common causes:
   - **Image pull error**: the container image doesn't exist or requires authentication
   - **Insufficient resources**: the tenant's resource quota is exhausted
   - **Port conflict**: another service is using the same port in the namespace

3. Check resource usage:
   ```
   "What's the resource usage for my-team?"
   ```

### Service shows "OutOfSync" in ArgoCD

ArgoCD detected a difference between the GitOps repo and the cluster state.

- **Expected after a deploy**: ArgoCD syncs automatically within 3 minutes
- **Persistent OutOfSync**: someone may have manually modified the cluster. ArgoCD will reconcile on next sync
- Check the ArgoCD UI at [ops.mctl.ai](https://ops.mctl.ai) for diff details

### Service shows "Degraded" health

The service is running but not healthy. Common causes:

1. **Crash loop**: the container is repeatedly crashing
   ```
   "Show me logs for my-app in staging"
   ```
2. **Failed readiness probe**: the `/healthz` or `/readyz` endpoint is not responding
   - Check that your app listens on the configured port
   - Verify environment variables are set correctly
3. **OOMKilled**: the container exceeds its memory limit
   ```
   "What's the resource usage for staging?"
   ```
   Consider scaling up memory limits or optimizing your application.

### "Operation not found" error

The operation name must match a registered operation exactly. Available operations:

| Operation | Description |
|-----------|-------------|
| `deploy-service` | Deploy or update a service |
| `create-tenant` | Create a new tenant |
| `provision-database` | Provision PostgreSQL |
| `retire-service` | Remove a service |
| `delete-tenant` | Delete a tenant |
| `rollback-service` | Rollback to a previous tag |
| `preview-deploy` | Create preview environment |
| `preview-delete` | Delete preview environment |

Use `mctl_list_operations` to see the full list with parameters.

### Image pull errors

If you see `ImagePullBackOff` or `ErrImagePull`:

1. Verify the image exists:
   ```bash
   docker pull ghcr.io/your-org/your-image:tag
   ```
2. For private images, grant repository access:
   ```
   "Grant access to repo myorg/my-app for my-team"
   ```
3. Check that the image tag is correct — tags are case-sensitive

## Databases

### Database provisioning fails

The `provision-database` operation creates a PostgreSQL database on the shared CNPG cluster.

Common issues:
- **Database name conflict**: a database with that name already exists in the tenant
- **Quota exceeded**: the tenant has reached its pod limit
- **Vault permissions**: the tenant's Vault policy may not include the `teams/{team}/*` path

### Cannot connect to database

Database credentials are stored in Vault and synced to Kubernetes secrets via ExternalSecrets.

1. Verify the secret exists in your namespace:
   ```
   "Show me the status of my-app in staging"
   ```
2. Check that your application reads the correct environment variables:
   - `DATABASE_URL` or individual `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
3. The database uses PgBouncer — connect on port `5432`, not the CNPG internal port

## Domains

### Custom domain shows "pending"

After adding a domain, you need to create a CNAME record pointing to your service's default host.

1. Add the CNAME record at your DNS provider:
   ```
   api.example.com  CNAME  my-app.mctl.ai
   ```
2. Wait for DNS propagation (usually 1-5 minutes, up to 48 hours)
3. Verify the domain:
   ```
   "Verify domain api.example.com for my-app in staging"
   ```

### TLS certificate not issued

TLS certificates are provisioned by cert-manager with Let's Encrypt after DNS verification succeeds.

- Check that the CNAME record is correctly configured
- Let's Encrypt has rate limits — if you've recently issued many certificates, you may need to wait
- Verify at [ops.mctl.ai](https://ops.mctl.ai) that the Certificate resource exists and check its status

## Preview Environments

### Preview not accessible

Previews get a temporary domain based on the preview name. Check:

1. That the preview was created successfully:
   ```
   "List all previews in staging"
   ```
2. The preview's health status — it follows the same deployment pipeline as regular services
3. Preview TTL — previews auto-delete after the configured TTL (default: 24 hours)

## Self-Healing Agent

### Agent not creating PRs for incidents

The mctl-agent processes alerts from AlertManager. If PRs aren't appearing:

1. Check that the alert is firing in AlertManager
2. The agent may have classified the alert as informational (no action needed)
3. Some alerts are suppressed to reduce noise (e.g. monitoring meta-alerts)
4. Check agent logs at [agent.mctl.ai](https://agent.mctl.ai)

### Agent PR was not merged

Agent PRs require manual review and approval. Check:
- The PR in the `mctl-gitops` repository on GitHub
- Telegram notifications for operator approval requests
- The incident status via MCP: `"Show me details of incident INC-xxx"`

## Getting Help

If your issue isn't covered here:

1. Check the [FAQ](/reference/faq)
2. Search the [MCP Tools Reference](/mcp/tools-reference) for the relevant tool
3. Open an issue on [GitHub](https://github.com/mctlhq)
4. Contact support at support@mctl.ai

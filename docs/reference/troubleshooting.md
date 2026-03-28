# Troubleshooting

## MCP Connection Issues

**"Unauthorized" error when connecting**
- Verify your token is valid by signing in again at [mctl.ai/mcp](https://mctl.ai/mcp)
- Check that your GitHub account has organization membership
- Ensure the `Authorization: Bearer` header is correctly formatted

**Tools not appearing in Claude.ai**
- Disconnect and reconnect the MCP server
- Check that the connector shows a green status indicator
- Try starting a new conversation

**Timeout errors**
- Some operations (deploy, scale) are async — use the operation ID to check status
- If the MCP endpoint itself is timing out, check [status page] or try again

## Deployment Issues

**Deployment stuck in "Pending"**
- Check the operation status for error details
- Verify the container image exists and is accessible
- Check resource quotas — the tenant may not have enough resources

**Service not healthy after deploy**
- Check service logs: `"Show me logs for my-app in staging"`
- Check resource usage — the service may be OOMKilled
- Verify environment variables and configuration

## Tenant Issues

**Cannot see any tenants**
- Verify your GitHub organization membership
- Check that your GitHub team is mapped to a tenant
- Contact your platform admin

**"Forbidden" error on tenant operations**
- You may not have the required group membership for this tenant
- Destructive operations (delete tenant) require admin access

<!-- TODO: Add more troubleshooting entries based on support tickets -->
